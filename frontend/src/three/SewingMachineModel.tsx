import { lazy, Suspense } from "react";

/** Lazy-loaded so Three.js (heavy) never blocks first paint. */
const LazySewingMachineCanvas = lazy(() => import("./SewingMachineModelCanvas"));

export function SewingMachineModelFallback({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-ink/5 ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className="text-5xl opacity-60">🧵</span>
    </div>
  );
}

/**
 * Public entry point: the vintage hand-crank sewing machine hero model, tied to
 * Radha's story. Renders a placeholder while the Three.js chunk loads, and a plain
 * emoji if WebGL isn't available (handled inside SewingMachineModelCanvas/Scene3D).
 */
export function SewingMachineModel({ className }: { className?: string }) {
  return (
    <Suspense fallback={<SewingMachineModelFallback className={className} />}>
      <LazySewingMachineCanvas className={className} />
    </Suspense>
  );
}

export default SewingMachineModel;
