import { formatMon } from "../lib/format";

export function MoneyAmount({ wei, size = "lg" }: { wei: bigint; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeClass = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  }[size];

  return <span className={`amount ${sizeClass} text-ink`}>{formatMon(wei)}</span>;
}
