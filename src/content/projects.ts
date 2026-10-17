export type Project = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  featured?: boolean;
  year?: string;
  role?: string;
  overview?: string[];
  repoUrl?: string;
  liveUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "bizsawa-finai",
    title: "BizSawa / FinAI",
    summary:
      "A mobile-first business platform for Kenyan and East African small traders: POS, inventory, WhatsApp invoicing, M-Pesa and an AI assistant.",
    tags: ["React Native", "Node.js", "TypeScript", "PostgreSQL", "LLM"],
    featured: true,
    role: "Developer (team project)",
    overview: [
      "Small traders juggle sales, stock, invoices and cash flow on unreliable connectivity. BizSawa (also built as FinAI) is a mobile-first platform for Kenyan and East African MSMEs that brings point of sale, inventory, invoicing delivered over WhatsApp, expenses and M-Pesa payments into one offline-first workspace. It was a GITEX 2026 contender.",
      "Built as a team project. My part: the mobile app across 12+ screens with its backend integration layer (REST API design, authentication, data delivery) and LLM agent orchestration, plus integration tests for the API layer that caught edge-case failures before production.",
    ],
    repoUrl: "https://github.com/nxthxnael/Bizsawa",
    liveUrl: "https://bizsawa-frontend.vercel.app/",
  },
  {
    slug: "full-stack-ecommerce-app",
    title: "Full-Stack E-Commerce App",
    summary:
      "A cross-platform e-commerce app: React Native and Expo on the client, a type-safe Node.js and PostgreSQL REST API behind it.",
    tags: ["React Native", "Expo", "TypeScript", "Node.js", "PostgreSQL"],
    featured: true,
    role: "Full-stack developer",
    overview: [
      "A full-stack, cross-platform e-commerce app. The client is React Native with Expo (Expo Router, Gluestack UI, TanStack Query, Zustand). The backend is a Node.js and Express REST API in TypeScript on PostgreSQL, using Drizzle ORM and zod for validation.",
      "I designed and built it end to end: a reusable component architecture on the client, a type-safe Drizzle schema across 4 relational data models, and authenticated REST APIs. Strict TypeScript and structured code review reduced runtime errors by 40%, and I tuned SQL queries and data-model relationships for performance and scalability.",
    ],
    repoUrl: "https://github.com/nxthxnael/fullstack-ecommerce-app",
  },
  {
    slug: "qrix",
    title: "QRix",
    summary:
      "A fast, minimal QR code generator in plain HTML, CSS and JavaScript, with custom colors and PNG or SVG export.",
    tags: ["HTML", "CSS", "JavaScript"],
    featured: true,
    role: "Developer",
    overview: [
      "QRix is a fast, minimal, responsive QR code generator built with HTML, CSS and vanilla JavaScript, with no framework.",
      "It generates codes in real time for URLs, plain text, phone numbers, email addresses and Wi-Fi credentials. You can change the colors and size, download the result as PNG or SVG, or copy it to the clipboard. The layout is mobile-first.",
    ],
    repoUrl: "https://github.com/nxthxnael/QRix",
    liveUrl: "https://q-rix.vercel.app",
  },
  {
    slug: "ui-agent-chrome-extension",
    title: "UI Agent Chrome Extension",
    summary:
      "My final year project: a browser tool with an end-to-end data pipeline, from input ingestion to LLM-assisted structured output and export.",
    tags: ["TypeScript", "React", "Chrome Extensions", "LLM APIs", "Node.js"],
    role: "Developer (final year project)",
    overview: [
      "My final year project: a browser tool built around a data pipeline that runs input ingestion, API integration and structured output parsing, then exports the result.",
      "I built it full stack, with a React UI layer, the Chrome Extensions API, LLM API integration and a Node.js data pipeline. I documented edge cases, technical decisions and integration patterns along the way so the project could be handed off to other contributors.",
    ],
  },
  {
    slug: "mobile-learning-platform",
    title: "Mobile Learning Platform",
    summary:
      "A Flutter learning app with REST API integration and SQL-backed offline sync.",
    tags: ["Flutter", "Dart", "REST APIs", "SQL"],
    role: "Mobile developer",
    overview: [
      "A mobile learning application built with Flutter and Dart that integrates REST APIs and keeps working offline.",
      "It manages around 56 discrete data points with 75% offline persistence, using resilient API sync and local caching. That gave me practical experience with data-reliability patterns applicable to field-facing digital finance tools.",
    ],
  },
  {
    slug: "notely-mui",
    title: "Notely",
    summary:
      "A full-stack note-taking platform with Material UI themes, a real-time Markdown editor and JWT authentication.",
    tags: ["React", "Node.js", "Prisma", "PostgreSQL", "Material UI"],
    role: "Full-stack developer",
    overview: [
      "A modern full-stack note-taking platform built with React, Vite, Material UI, Node.js, Prisma and PostgreSQL. It has Material UI themes, a real-time Markdown editor and JWT authentication.",
      "The goal was a user-friendly app with smooth interactions that mimic the feel of real-world note-taking apps, where users manage their personal notes and ideas.",
    ],
    repoUrl: "https://github.com/nxthxnael/notely-mui",
  },
  {
    slug: "blogit-platform",
    title: "BlogIt Platform",
    summary:
      "A blogging platform where users create accounts, write and manage posts, and keep a personal profile.",
    tags: ["TypeScript", "Web App"],
    role: "Developer",
    overview: [
      "A basic yet functional blogging platform. Users create accounts, write and manage their blog posts, and maintain a personal profile.",
      "It is deployed on Vercel.",
    ],
    repoUrl: "https://github.com/nxthxnael/blogit-platform",
    liveUrl: "https://blogit-the-writers-platform.vercel.app",
  },
];

export function getFeaturedProjects(limit = 3): Project[] {
  return projects.filter((project) => project.featured).slice(0, limit);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
