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
    name: "Aditya U. Dengle",
    role: "Backend Developer",
    photoUrl: "https://media.licdn.com/dms/image/v2/D4D03AQEn0yj5zoQwHg/profile-displayphoto-crop_800_800/B4DZjHJmYJH0AM-/0/1755687840857?e=1791417600&v=beta&t=uQG5_w5C6j7FVU73ZL2mr94kgJbY0dRUkEjVvrc6New",
    college: "Vishwakarma Institute of Technology, Pune",
    department: "TY, Artificial Intelligence & Data Science",
    linkedinUrl: "https://www.linkedin.com/in/adityadengale/",
    githubUrl: "https://github.com/DevXDividends",
    motivation:
      "I've watched women in my own family run a chit fund on memory and trust alone — no record, no proof, just faith in each other. Writing the contract that finally gives that trust a permanent home didn't feel like an assignment.",
  },
  {
    name: "Kartik R. Pagariya",
    role: "AIML Developer",
    photoUrl: "https://media.licdn.com/dms/image/v2/D4E03AQHfIoFibBhVIA/profile-displayphoto-crop_800_800/B4EZqwcW3eKUAI-/0/1763896816275?e=1791417600&v=beta&t=EN6bZsfLLk5PWTWWd8GtIjfrafzh9Ifk8ba3V_gJWN0",
    college: "Vishwakarma Institute of Technology, Pune",
    department: "TY, Artificial Intelligence & Data Science",
    linkedinUrl: "https://www.linkedin.com/in/kartikpagariya1911/",
    githubUrl: "https://github.com/kartikpagariya25",
    motivation:
      "Every finance app I'd ever built assumed the user already had a credit score. Designing the screen where a woman's very first verifiable financial record comes into existence meant building the page that usually never gets built.",
  },
  {
    name: "Vikrant K. Kadam",
    role: "Full Stack Developer",
    photoUrl: "https://media.licdn.com/dms/image/v2/D4D03AQESIR9c5L1XLA/profile-displayphoto-crop_800_800/B4DZ8E_5OrGwAM-/0/1782495287789?e=1791417600&v=beta&t=0Wwt-oEx_d4n6z07THdP4aBVAFNLRT4kjMBWjnTmGSs",
    college: "Vishwakarma Institute of Technology, Pune",
    department: "TY, Artificial Intelligence & Data Science",
    linkedinUrl: "http://linkedin.com/in/vikrantkadam028/",
    githubUrl: "https://github.com/VikrantKadam028",
    motivation:
      "The best lesson data science ever taught me is that the data that matters most is usually the data nobody bothered to collect. Self-help groups have been generating exactly that kind of overlooked, valuable history for decades — I wanted to help it finally count.",
  },
];
