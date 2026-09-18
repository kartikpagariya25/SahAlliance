import { lazy, Suspense } from "react";

/** Lazy-loaded so Three.js (heavy) never blocks first paint. */
const LazyPotCanvas = lazy(() => import("./PotModelCanvas"));

export function PotModelFallback({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-accent-soft/60 ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className="text-5xl opacity-60">🏺</span>
    </div>
  );
}

/**
 * Public entry point: the terracotta money-pot ("gullak") hero model. Renders a
 * blurred/pulsing placeholder while the Three.js chunk loads, and a plain emoji if
 * WebGL isn't available on the device (handled inside PotModelCanvas/Scene3D).
 */
export function PotModel({ className }: { className?: string }) {
  return (
    <Suspense fallback={<PotModelFallback className={className} />}>
      <LazyPotCanvas className={className} />
    </Suspense>
  );
}

export default PotModel;
