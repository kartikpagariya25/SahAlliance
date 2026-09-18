import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { SectionReveal } from "../components/SectionReveal";

const STEPS = [
  { title: "Form a Circle", body: "5–20 women create a Circle on-chain. Each member has a wallet." },
  { title: "Contribute", body: "Every month, real value moves into the shared pot — timestamped, permanent." },
  { title: "Request a loan", body: "A member asks for an amount and states why." },
  { title: "Group approves", body: "Members vote. The moment a fixed majority says yes, funds release automatically." },
  { title: "Repay", body: "She repays over time; every repayment is logged against that exact loan." },
  { title: "History compounds", body: "A permanent, checkable credit record that didn't exist for her before." },
];

export function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".hero-eyebrow", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo(".hero-title", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.25")
        .fromTo(".hero-body", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.35")
        .fromTo(".hero-cta", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.3");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div>
      <section ref={heroRef} className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
        <p className="hero-eyebrow font-mono text-sm tracking-wide text-terracotta-dark uppercase">
          Monad Blitz Mumbai V4
        </p>
        <h1 className="hero-title font-display mt-4 text-3xl leading-tight text-ink sm:text-5xl">
          A WhatsApp-group savings circle — but the ledger can't be faked.
        </h1>
        <p className="hero-body mt-6 text-lg text-ink-soft">
          Meet Radha. She runs a tailoring stall. Every month she and four other women put ₹500 each into a
          shared pot — a Self-Help Group. Last year her group lent her ₹5,000 for a new sewing machine. She
          paid it back, every time. None of that exists anywhere a bank can see it. SahAlliance puts it on-chain.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="hero-cta rounded-full bg-terracotta px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-terracotta-dark"
          >
            Open the Circle Dashboard
          </Link>
          <Link
            to="/how-it-works"
            className="hero-cta rounded-full border border-border px-6 py-3 font-semibold text-ink transition-colors hover:bg-terracotta-soft"
          >
            See how it works
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <SectionReveal className="space-y-4">
            <h2 className="font-display text-2xl text-ink">Banks want collateral. Her home isn't in her name.</h2>
            <p className="text-ink-soft">
              Registered assets — land, homes — are overwhelmingly titled to male family members. Radha can have
              a working business and a perfect repayment intention, and still fail a bank's first question:
              what can you put up as security? Self-Help Groups already solve trust <em>inside</em> the group.
              They fail completely at trust <em>outside</em> it — exactly the trust a formal lender would need.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <SectionReveal className="mb-10 text-center">
          <h2 className="font-display text-2xl text-ink">The same ritual. Made verifiable.</h2>
        </SectionReveal>
        <SectionReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-border bg-surface p-5">
              <span className="font-mono text-sm text-terracotta-dark">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-lg text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
            </div>
          ))}
        </SectionReveal>
      </section>

      <section className="bg-ink py-16 text-cream">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <SectionReveal>
            <p className="font-display text-2xl leading-snug">
              "We didn't invent a new financial habit. We gave an existing trust a memory that survives outside
              the room it was built in — backed by money that actually moved."
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
