const NAMES = {
  "0x0000000000000000000000000000000000000001": "Radha",
  "0x0000000000000000000000000000000000000002": "Meena",
  "0x0000000000000000000000000000000000000003": "Sunita",
};

const state = {
  circle: {
    id: 1,
    name: "Radha's Circle",
    members: Object.keys(NAMES),
    potBalance: 1500,
  },
  loans: [],
  loanCount: 0,
  history: {},
  feed: [],
};

function pushHistory(address, entry) {
  if (!state.history[address]) state.history[address] = [];
  state.history[address].push(entry);
}

function pushFeed(entry) {
  state.feed.unshift(entry);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockChain = {
  nameOf(address) {
    return NAMES[address] || `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  async getCircle() {
    await delay(150);
    return { ...state.circle };
  },

  async getFeed() {
    await delay(100);
    return [...state.feed];
  },

  async contribute(address, amount) {
    const started = Date.now();
    await delay(400 + Math.random() * 300);
    state.circle.potBalance += amount;
    const entry = { type: "contribution", address, amount, timestamp: Date.now() };
    pushHistory(address, entry);
    pushFeed(entry);
    return { confirmMs: Date.now() - started };
  },

  async requestLoan(address, amount, purpose) {
    const started = Date.now();
    await delay(400);
    state.loanCount += 1;
    const loan = {
      id: state.loanCount,
      borrower: address,
      amount,
      purpose,
      yesVotes: 0,
      amountRepaid: 0,
      status: "open",
      voters: {},
    };
    state.loans.push(loan);
    const entry = { type: "loan_requested", address, amount, purpose, timestamp: Date.now() };
    pushHistory(address, entry);
    pushFeed(entry);
    return { loanId: loan.id, confirmMs: Date.now() - started };
  },

  async vote(loanId, voter, approve) {
    const started = Date.now();
    await delay(400);
    const loan = state.loans.find((l) => l.id === loanId);
    if (!loan) throw new Error("loan not found");
    if (loan.voters[voter]) throw new Error("already voted");
    loan.voters[voter] = approve;
    if (approve) loan.yesVotes += 1;
    pushFeed({ type: "vote", address: voter, loanId, approve, timestamp: Date.now() });

    const threshold = Math.floor(state.circle.members.length / 2) + 1;
    let released = false;
    if (loan.yesVotes >= threshold && loan.status === "open") {
      loan.status = "released";
      state.circle.potBalance -= loan.amount;
      released = true;
      const entry = { type: "loan_released", address: loan.borrower, amount: loan.amount, timestamp: Date.now() };
      pushHistory(loan.borrower, entry);
      pushFeed(entry);
    }
    return { confirmMs: Date.now() - started, released, loan: { ...loan } };
  },

  async repay(loanId, address, amount) {
    const started = Date.now();
    await delay(400);
    const loan = state.loans.find((l) => l.id === loanId);
    if (!loan) throw new Error("loan not found");
    loan.amountRepaid += amount;
    if (loan.amountRepaid >= loan.amount) loan.status = "repaid";
    state.circle.potBalance += amount;
    const entry = { type: "repayment", address, loanId, amount, timestamp: Date.now() };
    pushHistory(address, entry);
    pushFeed(entry);
    return { confirmMs: Date.now() - started, loan: { ...loan } };
  },

  async getLoans() {
    await delay(100);
    return state.loans.map((l) => ({ ...l }));
  },

  async getHistory(address) {
    await delay(100);
    return state.history[address] || [];
  },
};
