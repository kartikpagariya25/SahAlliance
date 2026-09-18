import { SectionReveal } from "../components/SectionReveal";
import { SewingMachineModel } from "../three/SewingMachineModel";

const STEPS = [
  {
    title: "Form a Circle",
    body: "A small group of women creates a Circle on-chain. Each member is identified by a wallet address, added once at creation.",
  },
  {
    title: "Contribute",
    body: "Each member deposits her regular contribution into the Circle's shared pot. It's a real transfer of value into the contract — timestamped, permanent, visible to the whole group.",
  },
  {
    title: "Request a loan",
    body: "A member requests a loan from the pot, stating the amount and her purpose.",
  },
  {
    title: "Group approves",
    body: "Other members vote yes or no. The moment a fixed majority of the Circle's members votes yes, the loan is transferred to her wallet automatically — in the same transaction as the deciding vote.",
  },
  {
    title: "Repay",
    body: "She repays over time. Each repayment is a real transfer back into the pot, logged against that specific loan, so its status is always known.",
  },
  {
    title: "The record compounds",
    body: "Every contribution, loan, and repayment becomes a permanent history tied to her wallet — checkable by anyone she chooses to show it to.",
  },
];

const FAQ = [
  {
    q: "Why blockchain and not just a database?",
    a: "A bank won't trust a database one party controls. A public, tamper-proof ledger is verifiable by a party that was never in the room.",
  },
  {
    q: "What stops the group from colluding to fake a good record?",
    a: "Honest answer: today it relies on the group's own honesty, same as physical Self-Help Groups do now. The improvement over a notebook is auditability, not cryptographic proof of honesty — a real v2 problem, named as future work.",
  },
  {
    q: "Who's the real customer?",
    a: "Two-sided: the women (free to use, better standing over time), and eventually the SHG networks, NGOs, and microfinance institutions who already work with millions of these groups and would pay for a verifiable member ledger.",
  },
  {
    q: "Is the money real?",
    a: "Yes. Contribute and repay are payable calls that move real value into and out of the pot — the demo isn't logging numbers, it's moving testnet MON.",
  },
];

export function HowItWorks() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SectionReveal className="mb-14 text-center">
        <p className="font-mono text-sm uppercase tracking-wide text-primary-dark">How it works</p>
        <h1 className="font-display mt-3 text-3xl text-ink sm:text-4xl">One cycle, repeated, made verifiable</h1>
      </SectionReveal>

      <ol className="space-y-10">
        {STEPS.map((step, i) => (
          <SectionReveal key={step.title}>
            <li className="flex gap-5">
              <span className="font-display flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary text-lg text-white">
                {i + 1}
              </span>
              <div>
                <h2 className="font-display text-xl text-ink">{step.title}</h2>
                <p className="mt-1 text-ink-soft">{step.body}</p>
              </div>
            </li>
          </SectionReveal>
        ))}
      </ol>

      <SectionReveal className="mt-20 flex flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
        <SewingMachineModel className="h-40 w-40 flex-none sm:h-48 sm:w-48" />
        <div>
          <h2 className="font-display text-xl text-ink">This is exactly how Radha got her machine</h2>
          <p className="mt-1 text-ink-soft">
            ₹5,000, requested through step 3, approved by her group in step 4, and repaid through step 5 —
            every rupee of it now a permanent record instead of a line in a notebook.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal className="mt-14">
        <h2 className="font-display text-2xl text-ink">Questions judges (and bankers) tend to ask</h2>
      </SectionReveal>
      <SectionReveal className="mt-6 space-y-6">
        {FAQ.map((item) => (
          <div key={item.q} className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-semibold text-ink">{item.q}</h3>
            <p className="mt-1 text-sm text-ink-soft">{item.a}</p>
          </div>
        ))}
      </SectionReveal>
    </div>
  );
}
