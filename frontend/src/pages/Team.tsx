import { SectionReveal } from "../components/SectionReveal";
import { TeamCard } from "../components/TeamCard";
import { TEAM_MEMBERS } from "../data/team";

export function Team() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <SectionReveal className="mb-12 text-center">
        <p className="font-mono text-sm uppercase tracking-wide text-primary-dark">Built by</p>
        <h1 className="font-display mt-3 text-3xl text-ink sm:text-4xl">The team behind SahAlliance</h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
          Three engineers who believe the biggest gap in Indian fintech isn't a missing feature — it's a missing
          <em> person</em>. Millions of women have been running proven, trustworthy credit systems for decades.
          We didn't build them a new one. We built the record they were always owed.
        </p>
      </SectionReveal>

      <SectionReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_MEMBERS.map((member) => (
          <TeamCard key={member.name + member.role} member={member} />
        ))}
      </SectionReveal>

      <SectionReveal className="mt-16 rounded-3xl border border-border bg-primary-soft p-8 text-center">
        <p className="font-display text-xl text-ink">
          Behind every "unbanked" statistic is a woman who was already banking — just without a bank.
        </p>
        <p className="mt-2 text-sm text-ink-soft">SahAlliance exists to make that work finally count.</p>
      </SectionReveal>
    </div>
  );
}
