import { useChain } from "../context/ChainContext";
import { initials } from "../lib/personas";

export function PersonaSwitcher() {
  const { persona, personas, setPersonaByName } = useChain();

  return (
    <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
        {initials(persona.name)}
      </span>
      <span className="text-ink-soft">Acting as</span>
      <select
        className="cursor-pointer bg-transparent font-semibold text-ink focus-visible:outline-none"
        value={persona.name}
        onChange={(e) => setPersonaByName(e.target.value)}
        aria-label="Switch acting member"
      >
        {personas.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
