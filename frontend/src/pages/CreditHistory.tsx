import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useChain } from "../context/ChainContext";
import { StatusBadge } from "../components/StatusBadge";
import { MoneyAmount } from "../components/MoneyAmount";
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
  const target = address ?? persona.address;
  const owner = personaByAddress(target);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loans, setLoans] = useState<Map<string, LoanView>>(new Map());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await client.getMemberHistory(target);
      if (cancelled) return;
      setHistory(entries);

      const loanIds = [...new Set(entries.filter((e) => e.loanId > 0n).map((e) => e.loanId.toString()))];
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
    const url = `${window.location.origin}/history/${target}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-xl font-semibold text-white">
          {initials(owner?.name ?? "?")}
        </span>
        <div>
          <h1 className="font-display text-2xl text-ink">{owner?.name ?? shortAddress(target)}'s credit history</h1>
          <p className="text-ink-soft">{summary}</p>
        </div>
      </div>

      <button
        onClick={copyShareLink}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-terracotta-dark transition-colors hover:bg-terracotta-soft"
      >
        {copied ? "✓ Link copied — share it with anyone" : "Share verifiable link"}
      </button>

      <ul className="mt-8 space-y-3">
        {sorted.length === 0 && <li className="text-sm text-ink-soft">No activity recorded yet.</li>}
        {sorted.map((entry, i) => {
          const loan = entry.loanId > 0n ? loans.get(entry.loanId.toString()) : undefined;
          return (
            <li key={i} className="rounded-2xl border border-border bg-surface p-4">
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
                  <StatusBadge status={loanRepaymentStatus(loan)} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
