// Shape mirrors contracts/SahAlliance.sol and mock/sahAllianceMock.mjs exactly,
// so this file stays correct across the mock-to-live swap.

export const ENTRY_TYPE = {
  Contribution: 0,
  LoanRequested: 1,
  VoteCast: 2,
  LoanReceived: 3,
  Repayment: 4,
} as const;

export const LOAN_STATUS = {
  Pending: 0,
  Released: 1,
} as const;

export interface CircleView {
  name: string;
  potBalance: bigint;
  voteThreshold: bigint;
  members: string[];
}

export interface LoanView {
  circleId: bigint;
  borrower: string;
  amount: bigint;
  purpose: string;
  yesVotes: bigint;
  amountRepaid: bigint;
  status: number;
}

export interface HistoryEntry {
  entryType: number;
  circleId: bigint;
  loanId: bigint;
  amount: bigint;
  timestamp: bigint;
}

export type LoanRepaymentStatus = "outstanding" | "partial" | "repaid";

export function loanRepaymentStatus(loan: LoanView): LoanRepaymentStatus {
  if (loan.amountRepaid <= 0n) return "outstanding";
  if (loan.amountRepaid < loan.amount) return "partial";
  return "repaid";
}

// SahAllianceClient is the shape both the mock and the future ethers-backed
// client must satisfy — pages are written against this interface only, so
// swapping the mock for the deployed contract touches ChainProvider alone.
export interface SahAllianceClient {
  circleCount(): Promise<bigint>;
  loanCount(): Promise<bigint>;
  getCircle(circleId: bigint | number): Promise<CircleView>;
  getLoan(loanId: bigint | number): Promise<LoanView>;
  hasVotedOnLoan(loanId: bigint | number, member: string): Promise<boolean>;
  isCircleMember(circleId: bigint | number, account: string): Promise<boolean>;
  getMemberHistory(member: string): Promise<HistoryEntry[]>;
  connect(address: string): SahAllianceWriter;
}

export interface TxReceipt {
  status: number;
  hash: string;
  confirmedInMs: number;
  [key: string]: unknown;
}

export interface SahAllianceWriter extends SahAllianceClient {
  createCircle(name: string, memberAddresses: string[]): Promise<{ wait(): Promise<TxReceipt & { circleId: bigint }> }>;
  contribute(circleId: bigint | number, overrides: { value: bigint }): Promise<{ wait(): Promise<TxReceipt> }>;
  requestLoan(
    circleId: bigint | number,
    amount: bigint,
    purpose: string
  ): Promise<{ wait(): Promise<TxReceipt & { loanId: bigint }> }>;
  voteOnLoan(loanId: bigint | number, approve: boolean): Promise<{ wait(): Promise<TxReceipt & { released: boolean }> }>;
  repayLoan(loanId: bigint | number, overrides: { value: bigint }): Promise<{ wait(): Promise<TxReceipt> }>;
}
