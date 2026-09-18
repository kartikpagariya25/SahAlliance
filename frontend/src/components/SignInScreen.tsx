import { motion } from "framer-motion";
import { useChain } from "../context/ChainContext";
import { initials } from "../lib/personas";

export function SignInScreen({ title = "Who are you in this Circle?" }: { title?: string }) {
  const { personas, signIn } = useChain();

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8"
      >
        <p className="font-mono text-xs uppercase tracking-wide text-primary-dark">Sign in</p>
        <h1 className="font-display mt-2 text-2xl text-ink">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">Pick your member card to act on her behalf in this demo.</p>

        <div className="mt-6 space-y-3">
          {personas.map((p, i) => (
            <motion.button
              key={p.name}
              onClick={() => signIn(p.name)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center gap-4 rounded-2xl border border-border bg-frost/60 px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary-soft"
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-dark text-lg font-semibold text-white">
                {initials(p.name)}
              </span>
              <span className="flex-1">
                <span className="block font-display text-lg text-ink">{p.name}</span>
                <span className="block text-sm text-ink-soft">{p.role}</span>
              </span>
              <span className="text-primary-dark">→</span>
            </motion.button>
          ))}
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          No password needed. Real Circles use assisted sign-in — a facilitator helps members without a
          smartphone access their record, the same way SahAlliance stands in for wallets here.
        </p>
      </motion.div>
    </div>
  );
}
