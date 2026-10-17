export const bio = [
  "I'm Nathanael Mutua (nxthxnael), a software engineer in Nairobi, Kenya, with a B.Sc. in Software Engineering from Murang'a University of Technology (2026).",
  "I build full-stack web and mobile apps with React, React Native, Flutter, Node.js and Go, and I care about clean API contracts, well-designed relational schemas and shipping reliably through CI/CD. I also design the interfaces and think about how a product should make money, usually on the same project.",
];

export type SkillGroup = {
  category: string;
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: "Frontend",
    skills: [
      "React",
      "React Native / Expo",
      "Flutter",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5 & CSS3",
    ],
  },
  {
    category: "Backend & APIs",
    skills: ["Node.js", "Express", "Go (Fiber, Gin)", "REST API design", "OAuth2 / JWT"],
  },
  {
    category: "Databases",
    skills: ["PostgreSQL", "MongoDB", "Prisma", "Drizzle ORM"],
  },
  {
    category: "Testing & QA",
    skills: ["Unit & integration tests", "Postman", "Bruno", "Code review"],
  },
  {
    category: "Dev tools & process",
    skills: [
      "Git & GitHub",
      "Jira",
      "Agile / Scrum",
      "CI/CD",
      "Docker",
      "Vercel",
      "Render",
      "Railway",
    ],
  },
  {
    category: "Learning",
    skills: ["C# / .NET Core", "Python (pandas, numpy, scikit-learn)"],
  },
];

export type TimelineEntry = {
  period: string;
  title: string;
  description: string;
};

// Newest first.
export const timeline: TimelineEntry[] = [
  {
    period: "Aug 2026",
    title: "Graduated, B.Sc. Software Engineering",
    description: "Murang'a University of Technology, Nairobi (2022 to 2026).",
  },
  {
    period: "May to Jun 2026",
    title: "Project Management Associate Intern, Excelerate | Saint Louis University",
    description:
      "Remote. Ran Jira workflows across 4 concurrent projects, with 100% milestone compliance and a 20% shorter design-to-delivery time.",
  },
  {
    period: "Jan to Feb 2026",
    title: "Flutter Mobile Developer Intern, Excelerate | Saint Louis University",
    description:
      "Remote. Built 12 reusable UI components and integrated REST APIs in a 4-developer Agile team, delivering 100% of features on time.",
  },
  {
    period: "May to Aug 2025",
    title: "Software Engineer Attaché, Teach2Give (The Jitu)",
    description:
      "Nyeri. Delivered 2 production web apps end to end with 9 RESTful APIs, OAuth2 authentication and CI/CD on Vercel, Render and Railway.",
  },
];
