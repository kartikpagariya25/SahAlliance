import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { formatMon } from "../lib/format";

export function MoneyAmount({ wei, size = "lg" }: { wei: bigint; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeClass = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  }[size];

  const target = Number(wei) / 1e18;
  const [display, setDisplay] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    if (from === target) {
      setDisplay(target);
      return;
    }
    const controls = animate(from, target, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [target]);

  return (
    <span className={`amount ${sizeClass} text-ink`}>
      {formatMon(BigInt(Math.round(display * 1e18)))}
    </span>
  );
}
