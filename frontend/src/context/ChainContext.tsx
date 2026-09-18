import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
// Single source of truth shared with the Hardhat test suite — see
// backend/mock/sahAllianceMock.mjs. Swapping to the live contract means
// changing only this import and the client construction below.
import { SahAllianceMock } from "../../../backend/mock/sahAllianceMock.mjs";
import { PERSONAS, type Persona } from "../lib/personas";
import type { SahAllianceClient, TxReceipt } from "../lib/types";

const SESSION_KEY = "sahalliance.session.personaName";

interface ChainContextValue {
  client: SahAllianceClient;
  persona: Persona | null;
  personas: Persona[];
  signIn: (name: string) => void;
  signOut: () => void;
  circleId: bigint | null;
  version: number;
  lastReceipt: TxReceipt | null;
  runWrite: <T extends TxReceipt>(action: () => Promise<{ wait(): Promise<T> }>) => Promise<T>;
}

const ChainContext = createContext<ChainContextValue | null>(null);

export function ChainProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => new SahAllianceMock() as unknown as SahAllianceClient, []);
  const [personaName, setPersonaName] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  });
  const [circleId, setCircleId] = useState<bigint | null>(null);
  const [version, setVersion] = useState(0);
  const [lastReceipt, setLastReceipt] = useState<TxReceipt | null>(null);
  const bootstrapped = useRef(false);

  const persona = personaName ? (PERSONAS.find((p) => p.name === personaName) ?? null) : null;

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      const tx = await client
        .connect(PERSONAS[0].address)
        .createCircle(
          "Radha's Circle",
          PERSONAS.map((p) => p.address)
        );
      const receipt = await tx.wait();
      setCircleId(receipt.circleId);
      setVersion((v) => v + 1);
    })();
  }, [client]);

  function signIn(name: string) {
    setPersonaName(name);
    try {
      window.localStorage.setItem(SESSION_KEY, name);
    } catch {
      // Private-browsing / storage-blocked — session just won't survive a refresh.
    }
  }

  function signOut() {
    setPersonaName(null);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore — nothing to clean up if storage was never writable.
    }
  }

  async function runWrite<T extends TxReceipt>(action: () => Promise<{ wait(): Promise<T> }>): Promise<T> {
    const tx = await action();
    const receipt = await tx.wait();
    setLastReceipt(receipt);
    setVersion((v) => v + 1);
    return receipt;
  }

  const value: ChainContextValue = {
    client,
    persona,
    personas: PERSONAS,
    signIn,
    signOut,
    circleId,
    version,
    lastReceipt,
    runWrite,
  };

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>;
}

export function useChain(): ChainContextValue {
  const ctx = useContext(ChainContext);
  if (!ctx) throw new Error("useChain must be used within ChainProvider");
  return ctx;
}
