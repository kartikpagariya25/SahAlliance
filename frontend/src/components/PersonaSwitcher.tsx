import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useChain } from "../context/ChainContext";
import { initials } from "../lib/personas";

export function PersonaSwitcher() {
  const { persona, personas, signIn, signOut } = useChain();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!persona) {
    return (
      <Link
        to="/dashboard"
        className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm transition-colors hover:border-primary"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-dark text-xs font-semibold text-white">
          {initials(persona.name)}
        </span>
        <span className="font-semibold text-ink">{persona.name}</span>
        <span className="text-ink-soft">{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
          >
            <p className="border-b border-border px-4 py-2 text-xs uppercase tracking-wide text-ink-soft">
              Switch member
            </p>
            {personas.map((p) => (
              <button
                key={p.name}
                role="menuitem"
                onClick={() => {
                  signIn(p.name);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-soft ${
                  p.name === persona.name ? "bg-primary-soft/60" : ""
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-dark">
                  {initials(p.name)}
                </span>
                <span>
                  <span className="block font-medium text-ink">{p.name}</span>
                  <span className="block text-xs text-ink-soft">{p.role}</span>
                </span>
                {p.name === persona.name && <span className="ml-auto text-primary">✓</span>}
              </button>
            ))}
            <button
              role="menuitem"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="w-full border-t border-border px-4 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger/5"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
