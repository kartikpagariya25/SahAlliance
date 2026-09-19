import { ethers } from "ethers";
import fs from "fs";
import db from "./db.js";

const abi = JSON.parse(fs.readFileSync(new URL("./abi.json", import.meta.url)));

const RPC_URL = process.env.RPC_URL || "https://rpc.testnet.monad.xyz";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error("Set CONTRACT_ADDRESS in backend/.env before starting the indexer.");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
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

contract.on("CircleCreated", async (circleId, name, members, event) => {
  await refreshCircle(circleId);
  console.log(`[indexer] Circle #${circleId} created: ${name} (${members.length} members)`);
});

contract.on("Contributed", (circleId, member, amount, timestamp, event) => {
  record("contribution", { circle_id: Number(circleId), address: member, amount: amount.toString(), timestamp: Number(timestamp) }, event.log.transactionHash);
  refreshCircle(circleId);
  console.log(`[indexer] Contribution: ${member} -> Circle #${circleId} (${ethers.formatEther(amount)} MON)`);
});

contract.on("LoanRequested", (loanId, circleId, borrower, amount, purpose, event) => {
  record("loan_requested", { circle_id: Number(circleId), loan_id: Number(loanId), address: borrower, amount: amount.toString(), purpose }, event.log.transactionHash);
  console.log(`[indexer] Loan #${loanId} requested by ${borrower}: ${purpose}`);
});

contract.on("Voted", (loanId, voter, approve, yesVotes, event) => {
  record("vote", { loan_id: Number(loanId), address: voter, amount: approve ? "1" : "0" }, event.log.transactionHash);
  console.log(`[indexer] Vote on loan #${loanId} by ${voter}: ${approve} (yesVotes=${yesVotes})`);
});

contract.on("LoanReleased", async (loanId, borrower, amount, event) => {
  const loan = await contract.getLoan(loanId);
  record("loan_released", { circle_id: Number(loan.circleId), loan_id: Number(loanId), address: borrower, amount: amount.toString() }, event.log.transactionHash);
  refreshCircle(loan.circleId);
  console.log(`[indexer] Loan #${loanId} released to ${borrower}: ${ethers.formatEther(amount)} MON`);
});

contract.on("Repaid", async (loanId, borrower, amount, amountRepaid, event) => {
  const loan = await contract.getLoan(loanId);
  record("repayment", { circle_id: Number(loan.circleId), loan_id: Number(loanId), address: borrower, amount: amount.toString() }, event.log.transactionHash);
  refreshCircle(loan.circleId);
  console.log(`[indexer] Repayment on loan #${loanId} by ${borrower}: ${ethers.formatEther(amount)} MON (total repaid: ${ethers.formatEther(amountRepaid)})`);
});

console.log(`[indexer] Listening on ${CONTRACT_ADDRESS} via ${RPC_URL}`);
