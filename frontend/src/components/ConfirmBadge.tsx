import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

  return (
    <AnimatePresence mode="wait">
      {pending && (
        <motion.span
          key="pending"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="inline-flex items-center gap-2 text-sm text-ink-soft"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Confirming…
        </motion.span>
      )}
      {!pending && visible && confirmedInMs !== null && (
        <motion.span
          key="confirmed"
          initial={{ opacity: 0, scale: 0.85, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-success"
        >
          ✓ Confirmed in {Math.round(confirmedInMs)}ms
        </motion.span>
      )}
    </AnimatePresence>
  );
}
