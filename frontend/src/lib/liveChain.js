import { ethers } from "ethers";
import { ABI } from "./abi.js";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CIRCLE_ID = 1;

function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}

async function getSigner() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

async function timedTx(txPromise) {
  const started = Date.now();
  const tx = await txPromise;
  await tx.wait();
  return { confirmMs: Date.now() - started, hash: tx.hash };
}

export const liveChain = {
  nameOf(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  async getCircle() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);
    const circle = await contract.circles(CIRCLE_ID);
    const members = await contract.getCircleMembers(CIRCLE_ID);
    return { id: CIRCLE_ID, name: circle.name, potBalance: ethers.formatEther(circle.potBalance), members };
  },

  async contribute(_address, amount) {
    const contract = getContract(await getSigner());
    const { confirmMs } = await timedTx(contract.contribute(CIRCLE_ID, { value: ethers.parseEther(String(amount)) }));
    return { confirmMs };
  },

  async requestLoan(_address, amount, purpose) {
    const contract = getContract(await getSigner());
    const { confirmMs } = await timedTx(contract.requestLoan(CIRCLE_ID, ethers.parseEther(String(amount)), purpose));
    return { confirmMs };
  },

  async vote(loanId, _voter, approve) {
    const contract = getContract(await getSigner());
    const { confirmMs } = await timedTx(contract.voteOnLoan(loanId, approve));
    const loan = await contract.getLoan(loanId);
    return { confirmMs, released: Number(loan.status) === 1, loan };
  },

  async repay(loanId, _address, amount) {
    const contract = getContract(await getSigner());
    const { confirmMs } = await timedTx(contract.repayLoan(loanId, { value: ethers.parseEther(String(amount)) }));
    const loan = await contract.getLoan(loanId);
    return { confirmMs, loan };
  },

  async getLoan(loanId) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);
    return contract.getLoan(loanId);
  },

  async getHistory(address) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);
    const raw = await contract.getMemberHistory(address);
    const types = ["contribution", "loan_requested", "vote", "loan_released", "repayment"];
    return raw.map((e) => ({
      type: types[Number(e.eventType)],
      loanId: Number(e.loanId),
      amount: ethers.formatEther(e.amount),
      timestamp: Number(e.timestamp) * 1000,
    }));
  },
};
