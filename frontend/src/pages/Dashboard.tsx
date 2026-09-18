import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useChain } from "../context/ChainContext";
import { RequireSignIn } from "../components/RequireSignIn";
import { MoneyAmount } from "../components/MoneyAmount";
import { ContributeModal } from "../components/ContributeModal";
import { RequestLoanModal } from "../components/RequestLoanModal";
import { initials, personaByAddress } from "../lib/personas";
import { formatMon, formatTimestamp, shortAddress } from "../lib/format";
import { ENTRY_TYPE, type CircleView, type HistoryEntry } from "../lib/types";

const ENTRY_LABEL: Record<number, string> = {
  [ENTRY_TYPE.Contribution]: "contributed",
  [ENTRY_TYPE.LoanRequested]: "requested a loan",
  [ENTRY_TYPE.VoteCast]: "voted on a loan",
  [ENTRY_TYPE.LoanReceived]: "received a loan",
  [ENTRY_TYPE.Repayment]: "made a repayment",
};

interface FeedItem extends HistoryEntry {
  member: string;
}

export function Dashboard() {
  return (
    <RequireSignIn>
      <DashboardContent />
    </RequireSignIn>
  );
}

function DashboardContent() {
  const { client, circleId, version } = useChain();
  const navigate = useNavigate();

  const [circle, setCircle] = useState<CircleView | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [modal, setModal] = useState<"contribute" | "request" | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    if (circleId === null) return;
    let cancelled = false;
    (async () => {
      const c = await client.getCircle(circleId);
      if (cancelled) return;
      setCircle(c);

      const histories = await Promise.all(
        c.members.map(async (member) => {
          const entries = await client.getMemberHistory(member);
          return entries.map((entry) => ({ ...entry, member }));
        })
      );
      if (cancelled) return;
      const merged = histories.flat().sort((a, b) => Number(b.timestamp - a.timestamp));
      setFeed(merged);
    })();
    return () => {
      cancelled = true;
    };
  }, [client, circleId, version]);

  if (circleId === null || !circle) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-ink-soft">Setting up the Circle…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-sm text-ink-soft">
        {circle.name} · {circle.members.length} members · majority of {circle.voteThreshold.toString()} to release
        a loan
      </p>

      {showGuide && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-3 rounded-2xl border border-primary-soft bg-primary-soft/60 p-4 text-sm text-primary-dark"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">New here? This is a live demo — try the whole cycle:</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                <li>Use your profile menu (top right) to switch between the three members.</li>
                <li>Contribute as each member to fill the shared pot.</li>
                <li>Request a loan, then switch persona and vote to approve it.</li>
                <li>Check Credit History to see the permanent record it created.</li>
              </ol>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              aria-label="Dismiss guide"
              className="shrink-0 rounded-full px-2 py-1 text-primary-dark/70 hover:bg-primary-soft"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      <div className="mt-3 rounded-3xl border border-border bg-linear-to-br from-primary-soft/50 via-surface to-surface p-8 text-center">
        <p className="text-sm uppercase tracking-wide text-ink-soft">Pot balance</p>
        <div className="mt-2">
          <MoneyAmount wei={circle.potBalance} size="xl" />
        </div>
      </div>

      <p className="mt-6 text-center text-xs uppercase tracking-wide text-ink-soft">
        Tap a member to see her credit history
      </p>
      <div className="mt-2 flex items-center justify-center gap-3">
        {circle.members.map((member) => {
          const owner = personaByAddress(member);
          return (
            <button
              key={member}
              onClick={() => navigate(`/history/${member}`)}
              title={owner ? owner.name : shortAddress(member)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary-dark transition-transform hover:-translate-y-0.5"
            >
              {initials(owner ? owner.name : shortAddress(member))}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => setModal("contribute")}
          className="flex-1 rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          Contribute
        </button>
        <button
          onClick={() => setModal("request")}
          className="flex-1 rounded-2xl border border-border bg-surface px-6 py-4 font-semibold text-ink transition-colors hover:bg-primary-soft"
        >
          Request a loan
        </button>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-ink">Recent activity</h2>
        <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
          {feed.length === 0 && <li className="px-5 py-4 text-sm text-ink-soft">No activity yet.</li>}
          {feed.slice(0, 12).map((item, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
              <span>
                <strong>{personaByAddress(item.member)?.name ?? shortAddress(item.member)}</strong>{" "}
                {ENTRY_LABEL[item.entryType]}
                {item.amount > 0n ? (
                  <>
                    {" "}
                    · <span className="amount">{formatMon(item.amount)}</span>
                  </>
                ) : null}
              </span>
              <span className="text-ink-soft">{formatTimestamp(item.timestamp)}</span>
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {modal === "contribute" && (
          <ContributeModal circleId={circleId} potBalance={circle.potBalance} onClose={() => setModal(null)} />
        )}
        {modal === "request" && <RequestLoanModal circleId={circleId} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}
