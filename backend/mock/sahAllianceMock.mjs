// Mirrors contracts/SahAlliance.sol exactly: same function names, same inputs,
// same require() messages, same return shapes. `connect(address)` stands in for
// ethers' `contract.connect(signer)`, and every write returns a tx-like object
// with `.wait()` so call sites don't change when the real contract is wired in.

export const ENTRY_TYPE = Object.freeze({
  Contribution: 0,
  LoanRequested: 1,
  VoteCast: 2,
  LoanReceived: 3,
  Repayment: 4,
});

export const LOAN_STATUS = Object.freeze({
  Pending: 0,
  Released: 1,
});

function fakeTxHash() {
  const bytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  return "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomConfirmMs() {
  return 150 + Math.random() * 350;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeTx(result) {
  const hash = fakeTxHash();
  return {
    hash,
    wait: async () => {
      const confirmedInMs = randomConfirmMs();
      await delay(confirmedInMs);
      return { status: 1, hash, confirmedInMs, ...result };
    },
  };
}

export class SahAllianceMock {
  constructor() {
    this._circles = new Map(); // circleId -> { name, members: string[], isMember: Set, potBalance: bigint, voteThreshold: number }
    this._loans = new Map(); // loanId -> { circleId, borrower, amount, purpose, hasVoted: Set, yesVotes, amountRepaid, status }
    this._history = new Map(); // address -> entry[]
    this._circleCount = 0n;
    this._loanCount = 0n;
  }

  connect(address) {
    return new BoundSahAllianceMock(this, address);
  }

  _pushHistory(address, entry) {
    if (!this._history.has(address)) this._history.set(address, []);
    this._history.get(address).push({ ...entry, timestamp: BigInt(Math.floor(Date.now() / 1000)) });
  }

  async circleCount() {
    return this._circleCount;
  }

  async loanCount() {
    return this._loanCount;
  }

  async getCircle(circleId) {
    const c = this._circles.get(String(circleId));
    if (!c) return { name: "", potBalance: 0n, voteThreshold: 0n, members: [] };
    return { name: c.name, potBalance: c.potBalance, voteThreshold: BigInt(c.voteThreshold), members: [...c.members] };
  }

  async getLoan(loanId) {
    const l = this._loans.get(String(loanId));
    if (!l) throw new Error("loan does not exist");
    return {
      circleId: l.circleId,
      borrower: l.borrower,
      amount: l.amount,
      purpose: l.purpose,
      yesVotes: BigInt(l.yesVotes),
      amountRepaid: l.amountRepaid,
      status: l.status,
    };
  }

  async hasVotedOnLoan(loanId, member) {
    const l = this._loans.get(String(loanId));
    if (!l) throw new Error("loan does not exist");
    return l.hasVoted.has(member);
  }

  async isCircleMember(circleId, account) {
    const c = this._circles.get(String(circleId));
    if (!c) return false;
    return c.isMember.has(account);
  }

  async getMemberHistory(member) {
    return [...(this._history.get(member) || [])];
  }
}

class BoundSahAllianceMock {
  constructor(mock, sender) {
    this._mock = mock;
    this.sender = sender;
  }

  // Reads are delegated so a bound instance can be used exactly like an
  // ethers contract connected to a signer, which also exposes view methods.
  circleCount() {
    return this._mock.circleCount();
  }
  loanCount() {
    return this._mock.loanCount();
  }
  getCircle(circleId) {
    return this._mock.getCircle(circleId);
  }
  getLoan(loanId) {
    return this._mock.getLoan(loanId);
  }
  hasVotedOnLoan(loanId, member) {
    return this._mock.hasVotedOnLoan(loanId, member);
  }
  isCircleMember(circleId, account) {
    return this._mock.isCircleMember(circleId, account);
  }
  getMemberHistory(member) {
    return this._mock.getMemberHistory(member);
  }

  async createCircle(name, memberAddresses) {
    if (memberAddresses.length < 2) throw new Error("circle needs at least 2 members");

    const seen = new Set();
    for (const addr of memberAddresses) {
      if (!addr) throw new Error("invalid member address");
      if (seen.has(addr)) throw new Error("duplicate member");
      seen.add(addr);
    }

    const circleId = this._mock._circleCount;
    this._mock._circleCount += 1n;

    this._mock._circles.set(String(circleId), {
      name,
      members: [...memberAddresses],
      isMember: seen,
      potBalance: 0n,
      voteThreshold: Math.floor(memberAddresses.length / 2) + 1,
    });

    return makeTx({ circleId });
  }

  async contribute(circleId, overrides = {}) {
    const value = BigInt(overrides.value ?? 0);
    const c = this._mock._circles.get(String(circleId));
    if (!c || !c.isMember.has(this.sender)) throw new Error("not a circle member");
    if (value <= 0n) throw new Error("contribution must be positive");

    c.potBalance += value;
    this._mock._pushHistory(this.sender, {
      entryType: ENTRY_TYPE.Contribution,
      circleId: BigInt(circleId),
      loanId: 0n,
      amount: value,
    });

    return makeTx({ potBalance: c.potBalance });
  }

  async requestLoan(circleId, amount, purpose) {
    const amt = BigInt(amount);
    const c = this._mock._circles.get(String(circleId));
    if (!c || !c.isMember.has(this.sender)) throw new Error("not a circle member");
    if (amt <= 0n) throw new Error("amount must be positive");
    if (amt > c.potBalance) throw new Error("amount exceeds pot balance");

    const loanId = this._mock._loanCount;
    this._mock._loanCount += 1n;

    this._mock._loans.set(String(loanId), {
      circleId: BigInt(circleId),
      borrower: this.sender,
      amount: amt,
      purpose,
      hasVoted: new Set(),
      yesVotes: 0,
      amountRepaid: 0n,
      status: LOAN_STATUS.Pending,
    });

    this._mock._pushHistory(this.sender, {
      entryType: ENTRY_TYPE.LoanRequested,
      circleId: BigInt(circleId),
      loanId,
      amount: amt,
    });

    return makeTx({ loanId });
  }

  async voteOnLoan(loanId, approve) {
    const l = this._mock._loans.get(String(loanId));
    if (!l) throw new Error("loan does not exist");
    const c = this._mock._circles.get(String(l.circleId));
    if (!c.isMember.has(this.sender)) throw new Error("not a circle member");
    if (l.status !== LOAN_STATUS.Pending) throw new Error("loan already resolved");
    if (l.hasVoted.has(this.sender)) throw new Error("already voted");

    l.hasVoted.add(this.sender);
    this._mock._pushHistory(this.sender, {
      entryType: ENTRY_TYPE.VoteCast,
      circleId: l.circleId,
      loanId: BigInt(loanId),
      amount: 0n,
    });

    let released = false;
    if (approve) {
      l.yesVotes += 1;
      if (l.yesVotes >= c.voteThreshold) {
        l.status = LOAN_STATUS.Released;
        c.potBalance -= l.amount;
        released = true;

        this._mock._pushHistory(l.borrower, {
          entryType: ENTRY_TYPE.LoanReceived,
          circleId: l.circleId,
          loanId: BigInt(loanId),
          amount: l.amount,
        });
      }
    }

    return makeTx({ yesVotes: BigInt(l.yesVotes), released, amount: released ? l.amount : 0n });
  }

  async repayLoan(loanId, overrides = {}) {
    const value = BigInt(overrides.value ?? 0);
    const l = this._mock._loans.get(String(loanId));
    if (!l) throw new Error("loan does not exist");
    if (l.status !== LOAN_STATUS.Released) throw new Error("loan not active");
    if (this.sender !== l.borrower) throw new Error("only borrower can repay");

    const remaining = l.amount - l.amountRepaid;
    if (remaining <= 0n) throw new Error("loan already fully repaid");

    const accepted = value > remaining ? remaining : value;
    if (accepted <= 0n) throw new Error("repayment must be positive");

    l.amountRepaid += accepted;
    const c = this._mock._circles.get(String(l.circleId));
    c.potBalance += accepted;

    this._mock._pushHistory(this.sender, {
      entryType: ENTRY_TYPE.Repayment,
      circleId: l.circleId,
      loanId: BigInt(loanId),
      amount: accepted,
    });

    return makeTx({ accepted, amountRepaid: l.amountRepaid, refunded: value - accepted });
  }
}
