import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useChain } from "../context/ChainContext";
import { StatusBadge } from "../components/StatusBadge";
import { MoneyAmount } from "../components/MoneyAmount";
import { RepayModal } from "../components/RepayModal";
import { initials, personaByAddress } from "../lib/personas";
import { formatTimestamp, shortAddress } from "../lib/format";
import { ENTRY_TYPE, loanRepaymentStatus, type HistoryEntry, type LoanView } from "../lib/types";

const ENTRY_LABEL: Record<number, string> = {
  [ENTRY_TYPE.Contribution]: "Contribution",
  [ENTRY_TYPE.LoanRequested]: "Loan requested",
  [ENTRY_TYPE.VoteCast]: "Vote cast",
  [ENTRY_TYPE.LoanReceived]: "Loan received",
  [ENTRY_TYPE.Repayment]: "Repayment",
};

export function CreditHistory() {
  const { address } = useParams<{ address?: string }>();
  const { client, persona, version } = useChain();
  const target = address ?? persona?.address ?? null;
  const owner = target ? personaByAddress(target) : undefined;

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loans, setLoans] = useState<Map<string, LoanView>>(new Map());
  const [copied, setCopied] = useState(false);
  const [repayLoanId, setRepayLoanId] = useState<bigint | null>(null);

  const isOwnPage = !!persona && target === persona.address;
  const repayingLoan = repayLoanId !== null ? loans.get(repayLoanId.toString()) : undefined;

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    (async () => {
      const entries = await client.getMemberHistory(target);
      if (cancelled) return;
      setHistory(entries);

      // loanId is 0 on Contribution entries as a "no loan" sentinel, which
      // collides with a real loan #0 (IDs are zero-indexed) — filter by
      // entry type instead of the loanId value to avoid excluding it.
      const loanIds = [
        ...new Set(
          entries.filter((e) => e.entryType !== ENTRY_TYPE.Contribution).map((e) => e.loanId.toString())
        ),
      ];
      const fetched = await Promise.all(loanIds.map((id) => client.getLoan(BigInt(id))));
      if (cancelled) return;
      setLoans(new Map(loanIds.map((id, i) => [id, fetched[i]])));
    })();
    return () => {
      cancelled = true;
    };
  }, [client, target, version]);

  const contributions = history.filter((e) => e.entryType === ENTRY_TYPE.Contribution);
  const loansReceived = [...new Set(history.filter((e) => e.entryType === ENTRY_TYPE.LoanReceived).map((e) => e.loanId.toString()))];

  const summary = useMemo(() => {
    const contributionPart = `${contributions.length} contribution${contributions.length === 1 ? "" : "s"}`;
    if (loansReceived.length === 0) return contributionPart;
    const statuses = loansReceived.map((id) => {
      const loan = loans.get(id);
      return loan ? loanRepaymentStatus(loan) : null;
    });
    const allRepaid = statuses.every((s) => s === "repaid");
    const loanPart = `${loansReceived.length} loan${loansReceived.length === 1 ? "" : "s"}, ${
      allRepaid ? "fully repaid" : "in progress"
    }`;
    return `${contributionPart} · ${loanPart}`;
  }, [contributions.length, loansReceived, loans]);

  const sorted = [...history].sort((a, b) => Number(b.timestamp - a.timestamp));

  function copyShareLink() {
    if (!target) return;
    const url = `${window.location.origin}/history/${target}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!target) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-display text-xl text-ink">Whose history do you want to see?</p>
        <p className="mt-2 text-sm text-ink-soft">
          Sign in to view your own record, or open a member's shared link directly.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
          {initials(owner?.name ?? "?")}
        </span>
        <div>
          <h1 className="font-display text-2xl text-ink">{owner?.name ?? shortAddress(target)}'s credit history</h1>
          <p className="text-ink-soft">{summary}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-primary-soft px-4 py-3 text-sm text-primary-dark">
        This is a record that didn't exist for her a year ago — permanent, portable, and hers to show to anyone.
      </div>

      <button
        onClick={copyShareLink}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-soft"
      >
        {copied ? "✓ Link copied — share it with anyone" : "Share verifiable link"}
      </button>

      <ul className="mt-8 space-y-3">
        {sorted.length === 0 && <li className="text-sm text-ink-soft">No activity recorded yet.</li>}
        {sorted.map((entry, i) => {
          const loan = loans.get(entry.loanId.toString());
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.04 }}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">{ENTRY_LABEL[entry.entryType]}</span>
                <span className="text-xs text-ink-soft">{formatTimestamp(entry.timestamp)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                {entry.amount > 0n ? (
                  <MoneyAmount wei={entry.amount} size="sm" />
                ) : (
                  <span className="text-sm text-ink-soft">—</span>
                )}
                {loan && entry.entryType === ENTRY_TYPE.LoanReceived && (
                  <div className="flex items-center gap-2">
                    <StatusBadge status={loanRepaymentStatus(loan)} />
                    {isOwnPage && loan.amountRepaid < loan.amount && (
                      <button
                        onClick={() => setRepayLoanId(entry.loanId)}
                        className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary-dark"
                      >
                        Repay
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>

      <AnimatePresence>
        {repayingLoan && repayLoanId !== null && (
          <RepayModal
            loanId={repayLoanId}
            amount={repayingLoan.amount}
            amountRepaid={repayingLoan.amountRepaid}
            onClose={() => setRepayLoanId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
