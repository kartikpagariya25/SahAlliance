import type { LoanRepaymentStatus } from "../lib/types";

const STYLES: Record<LoanRepaymentStatus, { label: string; className: string }> = {
  outstanding: { label: "Outstanding", className: "bg-terracotta-soft text-terracotta-dark" },
  partial: { label: "Partially repaid", className: "bg-amber-100 text-warning" },
  repaid: { label: "Fully repaid", className: "bg-green-100 text-success" },
};

export function StatusBadge({ status }: { status: LoanRepaymentStatus }) {
  const { label, className } = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {status === "repaid" ? "✓ " : ""}
      {label}
    </span>
  );
}
