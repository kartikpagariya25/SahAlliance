import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useChain } from "../context/ChainContext";
import { RequireSignIn } from "../components/RequireSignIn";
import { MoneyAmount } from "../components/MoneyAmount";
import { ConfirmBadge } from "../components/ConfirmBadge";
import { StatusBadge } from "../components/StatusBadge";
import { RepayModal } from "../components/RepayModal";
import { initials, personaByAddress } from "../lib/personas";
import { shortAddress } from "../lib/format";
import { LOAN_STATUS, loanRepaymentStatus, type CircleView, type LoanView } from "../lib/types";

export function LoanVoting() {
  return (
    <RequireSignIn>
      <LoanVotingContent />
    </RequireSignIn>
  );
}

function LoanVotingContent() {
  const { loanId } = useParams<{ loanId: string }>();
  const { client, persona, version, runWrite } = useChain();

  const [loan, setLoan] = useState<LoanView | null>(null);
  const [circle, setCircle] = useState<CircleView | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [myVoteChoice, setMyVoteChoice] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmMs, setConfirmMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRepay, setShowRepay] = useState(false);

  useEffect(() => {
    if (!loanId || !persona) return;
    const loanIdBig = BigInt(loanId);
    let cancelled = false;
    (async () => {
      const l = await client.getLoan(loanIdBig);
      if (cancelled) return;
      setLoan(l);
      const [c, voted] = await Promise.all([
        client.getCircle(l.circleId),
        client.hasVotedOnLoan(loanIdBig, persona.address),
      ]);
      if (cancelled) return;
      setCircle(c);
      setHasVoted(voted);
    })();
    return () => {
      cancelled = true;
    };
  }, [client, loanId, persona, version]);

  async function vote(approve: boolean) {
    if (!loanId || !persona) return;
    setError(null);
    setPending(true);
    try {
      const receipt = await runWrite(() =>
        client.connect(persona.address).voteOnLoan(BigInt(loanId), approve)
      );
      setMyVoteChoice(approve);
      setConfirmMs(receipt.confirmedInMs);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  if (!loan || !circle || !persona) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-ink-soft">Loading loan request…</div>;
  }

  const borrower = personaByAddress(loan.borrower);
  const progress = Math.min(100, (Number(loan.yesVotes) / Number(circle.voteThreshold)) * 100);
  const released = loan.status === LOAN_STATUS.Released;
  const isBorrower = persona.address === loan.borrower;
  const fullyRepaid = loan.amountRepaid >= loan.amount;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
            {initials(borrower?.name ?? "?")}
          </span>
          <div>
            <p className="font-display text-lg text-ink">{borrower?.name ?? "Unknown member"}</p>
            <p className="text-sm text-ink-soft">{borrower?.role}</p>
          </div>
        </div>

        <div className="mt-5">
          <MoneyAmount wei={loan.amount} size="xl" />
          <p className="mt-1 text-ink-soft">{loan.purpose}</p>
        </div>

        {!released && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-ink-soft">
              <span>Votes to release</span>
              <span>
                {loan.yesVotes.toString()} of {circle.voteThreshold.toString()} needed
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-frost-soft">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-primary to-primary-dark"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-6">
          {released ? (
            <div>
              <div className="rounded-xl bg-green-50 px-4 py-3 text-success">
                ✓ Loan released — funds sent to {borrower?.name ?? shortAddress(loan.borrower)}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-ink-soft">Repayment status</span>
                <StatusBadge status={loanRepaymentStatus(loan)} />
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-frost-soft">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{ width: `${(Number(loan.amountRepaid) / Number(loan.amount)) * 100}%` }}
                />
              </div>

              {isBorrower && !fullyRepaid && (
                <button
                  onClick={() => setShowRepay(true)}
                  className="mt-4 w-full rounded-2xl bg-primary px-6 py-3.5 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
                >
                  Repay this loan
                </button>
              )}
              {isBorrower && fullyRepaid && (
                <p className="mt-4 text-center text-sm font-semibold text-success">
                  ✓ Fully repaid — this is now part of your permanent credit history
                </p>
              )}
            </div>
          ) : isBorrower ? (
            <div className="rounded-xl bg-frost-soft px-4 py-3 text-sm text-ink-soft">
              This is your request — the other members of the Circle will vote on it.
            </div>
          ) : hasVoted ? (
            <div className="rounded-xl bg-primary-soft px-4 py-3 text-primary-dark">
              {myVoteChoice === true && "You approved this ✓"}
              {myVoteChoice === false && "You declined this"}
              {myVoteChoice === null && "You've already voted on this request."}
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => vote(true)}
                disabled={pending}
                className="flex-1 rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => vote(false)}
                disabled={pending}
                className="flex-1 rounded-2xl border border-border bg-surface px-6 py-4 font-semibold text-ink transition-colors hover:bg-frost-soft disabled:opacity-60"
              >
                Decline
              </button>
            </div>
          )}
          <div className="mt-3">
            <ConfirmBadge pending={pending} confirmedInMs={confirmMs} />
          </div>
        </div>
      </div>

      <Link to="/dashboard" className="mt-6 inline-block text-sm text-primary-dark hover:underline">
        ← Back to Circle dashboard
      </Link>

      <AnimatePresence>
        {showRepay && (
          <RepayModal
            loanId={BigInt(loanId!)}
            amount={loan.amount}
            amountRepaid={loan.amountRepaid}
            onClose={() => setShowRepay(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
