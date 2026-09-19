import { ethers } from "ethers";
import fs from "fs";
import db from "./db.js";

const abi = JSON.parse(fs.readFileSync(new URL("./abi.json", import.meta.url)));

const RPC_URL = process.env.RPC_URL || "https://testnet-rpc.monad.xyz";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const POLL_MS = 1000;
const MAX_BLOCK_RANGE = 50;

if (!CONTRACT_ADDRESS) {
  console.error("Set CONTRACT_ADDRESS in backend/.env before starting the indexer.");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true });
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

const insertEvent = db.prepare(`
  INSERT OR IGNORE INTO events (type, circle_id, loan_id, address, amount, purpose, tx_hash, timestamp)
  VALUES (@type, @circle_id, @loan_id, @address, @amount, @purpose, @tx_hash, @timestamp)
`);

const upsertCircle = db.prepare(`
  INSERT INTO circles (id, name, pot_balance) VALUES (@id, @name, @pot_balance)
  ON CONFLICT(id) DO UPDATE SET pot_balance = @pot_balance
`);

function record(type, fields, txHash) {
  insertEvent.run({
    type,
    circle_id: fields.circle_id ?? null,
    loan_id: fields.loan_id ?? null,
    address: fields.address ?? null,
    amount: fields.amount ?? null,
    purpose: fields.purpose ?? null,
    tx_hash: txHash,
    timestamp: fields.timestamp ?? Math.floor(Date.now() / 1000),
  });
}

async function refreshCircle(circleId) {
  const circle = await contract.circles(circleId);
  upsertCircle.run({ id: Number(circleId), name: circle.name, pot_balance: circle.potBalance.toString() });
}

async function blockTimestamp(blockNumber) {
  const block = await provider.getBlock(blockNumber);
  return block ? block.timestamp : Math.floor(Date.now() / 1000);
}

async function handleLog(log) {
  const parsed = contract.interface.parseLog(log);
  if (!parsed) return;
  const ts = await blockTimestamp(log.blockNumber);

  switch (parsed.name) {
    case "CircleCreated": {
      const [circleId, name, members] = parsed.args;
      await refreshCircle(circleId);
      console.log(`[indexer] Circle #${circleId} created: ${name} (${members.length} members)`);
      break;
    }
    case "Contributed": {
      const [circleId, member, amount] = parsed.args;
      record("contribution", { circle_id: Number(circleId), address: member, amount: amount.toString(), timestamp: ts }, log.transactionHash);
      await refreshCircle(circleId);
      console.log(`[indexer] Contribution: ${member} -> Circle #${circleId} (${ethers.formatEther(amount)} MON)`);
      break;
    }
    case "LoanRequested": {
      const [loanId, circleId, borrower, amount, purpose] = parsed.args;
      record("loan_requested", { circle_id: Number(circleId), loan_id: Number(loanId), address: borrower, amount: amount.toString(), purpose, timestamp: ts }, log.transactionHash);
      console.log(`[indexer] Loan #${loanId} requested by ${borrower}: ${purpose}`);
      break;
    }
    case "Voted": {
      const [loanId, voter, approve, yesVotes] = parsed.args;
      record("vote", { loan_id: Number(loanId), address: voter, amount: approve ? "1" : "0", timestamp: ts }, log.transactionHash);
      console.log(`[indexer] Vote on loan #${loanId} by ${voter}: ${approve} (yesVotes=${yesVotes})`);
      break;
    }
    case "LoanReleased": {
      const [loanId, borrower, amount] = parsed.args;
      const loan = await contract.getLoan(loanId);
      record("loan_released", { circle_id: Number(loan.circleId), loan_id: Number(loanId), address: borrower, amount: amount.toString(), timestamp: ts }, log.transactionHash);
      await refreshCircle(loan.circleId);
      console.log(`[indexer] Loan #${loanId} released to ${borrower}: ${ethers.formatEther(amount)} MON`);
      break;
    }
    case "Repaid": {
      const [loanId, borrower, amount, amountRepaid] = parsed.args;
      const loan = await contract.getLoan(loanId);
      record("repayment", { circle_id: Number(loan.circleId), loan_id: Number(loanId), address: borrower, amount: amount.toString(), timestamp: ts }, log.transactionHash);
      await refreshCircle(loan.circleId);
      console.log(`[indexer] Repayment on loan #${loanId} by ${borrower}: ${ethers.formatEther(amount)} MON (total repaid: ${ethers.formatEther(amountRepaid)})`);
      break;
    }
  }
}

async function poll(state) {
  try {
    const latest = await provider.getBlockNumber();
    if (latest <= state.lastBlock) return;

    const fromBlock = state.lastBlock + 1;
    const toBlock = Math.min(latest, fromBlock + MAX_BLOCK_RANGE - 1);

    const logs = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      await handleLog(log);
    }

    state.lastBlock = toBlock;
  } catch (err) {
    console.error("[indexer] poll error:", err.shortMessage || err.message);
  }
}

async function start() {
  const deployBlock = Number(process.env.DEPLOY_BLOCK || 0);
  const startBlock = deployBlock > 0 ? deployBlock - 1 : (await provider.getBlockNumber()) - 1;
  const state = { lastBlock: startBlock };

  console.log(`[indexer] Polling ${CONTRACT_ADDRESS} via ${RPC_URL} from block ${startBlock + 1}`);
  setInterval(() => poll(state), POLL_MS);
  poll(state);
}

start();