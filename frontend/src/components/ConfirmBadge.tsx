import { useEffect, useState } from "react";

// The single piece of choreography design.md §2.4 asks for: a loading state,
// then an explicit confirmation time, satisfying FR-8 for every
// contribute/vote/repay action.
export function ConfirmBadge({ pending, confirmedInMs }: { pending: boolean; confirmedInMs: number | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (confirmedInMs === null) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmedInMs]);

  if (pending) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
        <span className="h-2 w-2 animate-pulse rounded-full bg-terracotta" />
        Confirming…
      </span>
    );
  }

  if (!visible || confirmedInMs === null) return null;

  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-success transition-opacity duration-300">
      ✓ Confirmed in {Math.round(confirmedInMs)}ms
    </span>
  );
}
