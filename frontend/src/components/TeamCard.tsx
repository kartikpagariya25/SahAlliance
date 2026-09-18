import type { TeamMember } from "../data/team";
import { initials } from "../lib/personas";

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col rounded-3xl border border-border bg-surface p-6">
      {member.photoUrl ? (
        <img src={member.photoUrl} alt={member.name} className="h-20 w-20 rounded-full object-cover" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-terracotta text-2xl font-semibold text-white">
          {initials(member.name)}
        </div>
      )}

      <h3 className="font-display mt-4 text-xl text-ink">{member.name}</h3>
      <p className="text-sm font-semibold text-terracotta-dark">{member.role}</p>
      <p className="mt-1 text-sm text-ink-soft">
        {member.college} · {member.department}
      </p>

      <p className="mt-4 flex-1 text-sm italic text-ink-soft">"{member.motivation}"</p>

      <div className="mt-5 flex gap-3 text-sm font-semibold">
        <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="text-terracotta-dark hover:underline">
          LinkedIn
        </a>
        <a href={member.githubUrl} target="_blank" rel="noreferrer" className="text-terracotta-dark hover:underline">
          GitHub
        </a>
      </div>
    </div>
  );
}
