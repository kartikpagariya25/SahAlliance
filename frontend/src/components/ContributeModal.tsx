import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChain } from "../context/ChainContext";
import { MoneyAmount } from "./MoneyAmount";
import { monToWei } from "../lib/format";
import { inrEquivalent, CONTRIBUTION_PRESETS } from "../lib/currency";

export function ContributeModal({
  circleId,
  potBalance,
  onClose,
}: {
  circleId: bigint;
  potBalance: bigint;
  onClose: () => void;
}) {
  const { client, persona, runWrite } = useChain();
  const [amount, setAmount] = useState(CONTRIBUTION_PRESETS[0]);
  const [customInput, setCustomInput] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmMs, setConfirmMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!persona) return null;

  const effectiveAmount = useCustom ? Number(customInput || 0) : amount;
  const valid = effectiveAmount > 0;
  const projectedBalance = potBalance + (valid ? monToWei(String(effectiveAmount)) : 0n);

  async function handleSubmit() {
    if (!valid || !persona) return;
    setError(null);
    setPending(true);
    try {
      const receipt = await runWrite(() =>
        client.connect(persona.address).contribute(circleId, { value: monToWei(String(effectiveAmount)) })
      );
      setConfirmMs(receipt.confirmedInMs);
      setTimeout(onClose, 1800);
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  const done = confirmMs !== null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-6 shadow-xl sm:rounded-3xl"
      >
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="form" exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-ink">Contribute to the pot</h2>
                <button onClick={onClose} aria-label="Close" className="text-ink-soft hover:text-ink">
                  ✕
                </button>
              </div>
              <p className="mt-1 text-sm text-ink-soft">As {persona.name}, into {persona.name}'s Circle</p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CONTRIBUTION_PRESETS.map((preset) => {
                  const selected = !useCustom && amount === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => {
                        setUseCustom(false);
                        setAmount(preset);
                      }}
                      className={`rounded-xl border px-2 py-3 text-center transition-colors ${
                        selected
                          ? "border-primary bg-primary-soft text-primary-dark"
                          : "border-border bg-frost/60 text-ink hover:border-primary"
                      }`}
                    >
                      <span className="block font-display text-lg">{inrEquivalent(preset)}</span>
                      <span className="block text-xs text-ink-soft">{preset} MON</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setUseCustom((v) => !v)}
                className="mt-3 text-sm font-semibold text-primary-dark hover:underline"
              >
                {useCustom ? "Use a preset amount instead" : "Enter a custom amount"}
              </button>

              {useCustom && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                  <label className="block text-sm font-medium text-ink-soft">
                    Amount (MON)
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      autoFocus
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-frost px-3 py-2 text-ink"
                    />
                  </label>
                </motion.div>
              )}

              <div className="mt-5 flex items-center justify-between rounded-xl bg-frost-soft px-4 py-3 text-sm">
                <span className="text-ink-soft">New pot balance</span>
                <MoneyAmount wei={projectedBalance} size="sm" />
              </div>

              {error && <p className="mt-3 text-sm text-danger">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={!valid || pending}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Confirming…
                  </>
                ) : (
                  `Contribute ${inrEquivalent(effectiveAmount)}`
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 text-center"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-3xl text-white"
              >
                ✓
              </motion.span>
              <p className="mt-4 font-display text-lg text-ink">Contribution confirmed</p>
              <p className="mt-1 text-sm text-success">Confirmed in {Math.round(confirmMs ?? 0)}ms</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
