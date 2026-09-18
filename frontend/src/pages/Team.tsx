import { SectionReveal } from "../components/SectionReveal";
import { TeamCard } from "../components/TeamCard";
import { TEAM_MEMBERS } from "../data/team";

export function Team() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <SectionReveal className="mb-12 text-center">
        <p className="font-mono text-sm uppercase tracking-wide text-terracotta-dark">Built by</p>
        <h1 className="font-display mt-3 text-3xl text-ink sm:text-4xl">The team behind SahAlliance</h1>
      </SectionReveal>

      <SectionReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_MEMBERS.map((member) => (
          <TeamCard key={member.name + member.role} member={member} />
        ))}
      </SectionReveal>
    </div>
  );
}
