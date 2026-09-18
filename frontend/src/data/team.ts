// Placeholder team data — replace every field with real details before the demo.
// photoUrl left blank on purpose: TeamCard renders initials on a terracotta
// tile until a real photo URL (or an /src/assets import) is supplied.

export interface TeamMember {
  name: string;
  role: string;
  photoUrl: string;
  college: string;
  department: string;
  linkedinUrl: string;
  githubUrl: string;
  motivation: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Add your name",
    role: "Contract Lead",
    photoUrl: "",
    college: "Add your college name",
    department: "Add your department",
    linkedinUrl: "https://linkedin.com/in/your-handle",
    githubUrl: "https://github.com/your-handle",
    motivation: "Add the line that made this problem personal to you.",
  },
  {
    name: "Add your name",
    role: "Frontend Lead",
    photoUrl: "",
    college: "Add your college name",
    department: "Add your department",
    linkedinUrl: "https://linkedin.com/in/your-handle",
    githubUrl: "https://github.com/your-handle",
    motivation: "Add the line that made this problem personal to you.",
  },
  {
    name: "Add your name",
    role: "Pitch & Demo Lead",
    photoUrl: "",
    college: "Add your college name",
    department: "Add your department",
    linkedinUrl: "https://linkedin.com/in/your-handle",
    githubUrl: "https://github.com/your-handle",
    motivation: "Add the line that made this problem personal to you.",
  },
];
