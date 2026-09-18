// Cosmetic only: lets amounts read as rupees (what a member actually thinks
// in) while the chain still moves MON. 1 MON = ₹10,000 makes the demo's
// canonical numbers line up exactly — a ₹500 contribution is 0.05 MON, and
// Radha's ₹5,000 sewing-machine loan is 0.5 MON.
const INR_PER_MON = 10_000;

export function inrEquivalent(monAmount: number): string {
  const rupees = Math.round(monAmount * INR_PER_MON);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export const CONTRIBUTION_PRESETS = [0.05, 0.1, 0.2, 0.5];
export const LOAN_PRESETS = [0.5, 1, 2];
