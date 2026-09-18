import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useChain } from "../context/ChainContext";
import { monToWei } from "../lib/format";
import { inrEquivalent, LOAN_PRESETS } from "../lib/currency";

export function RequestLoanModal({ circleId, onClose }: { circleId: bigint; onClose: () => void }) {
  const { client, persona, runWrite } = useChain();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(LOAN_PRESETS[0]);
  const [customInput, setCustomInput] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!persona) return null;

  const effectiveAmount = useCustom ? Number(customInput || 0) : amount;
  const valid = effectiveAmount > 0 && purpose.trim().length > 0;

  async function handleSubmit() {
    if (!valid || !persona) return;
    setError(null);
    setPending(true);
    try {
      const receipt = await runWrite(() =>
        client.connect(persona.address).requestLoan(circleId, monToWei(String(effectiveAmount)), purpose.trim())
      );
      navigate(`/loan/${receipt.loanId}`);
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

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
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Request a loan</h2>
          <button onClick={onClose} aria-label="Close" className="text-ink-soft hover:text-ink">
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-ink-soft">As {persona.name}, from the shared pot</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {LOAN_PRESETS.map((preset) => {
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

        <label className="mt-4 block text-sm font-medium text-ink-soft">
          Purpose
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="New sewing machine"
            className="mt-1 w-full rounded-lg border border-border bg-frost px-3 py-2 text-ink"
          />
        </label>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!valid || pending}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Submitting…
            </>
          ) : (
            `Request ${inrEquivalent(effectiveAmount)}`
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
