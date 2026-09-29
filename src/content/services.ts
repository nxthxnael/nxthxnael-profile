// Placeholder packages — generated from a developer/designer/entrepreneur
// profile. Review pricing and scope before going live.

export type ServicePackage = {
  id: string;
  name: string;
  category: "Development" | "Design" | "Business";
  description: string;
  priceInKobo: number;
  currency: string;
  features: string[];
};

export const currency = "KES";

export const servicePackages: ServicePackage[] = [
  {
    id: "website-audit",
    name: "Website Audit & Fixes",
    category: "Development",
    description:
      "A review of your site's performance, SEO, and bugs, with the fixes applied.",
    priceInKobo: 1_500_000,
    currency,
    features: ["Full technical audit", "Written report", "Fixes included"],
  },
  {
    id: "landing-page-build",
    name: "Landing Page Build",
    category: "Development",
    description: "A single high-converting landing page, design to launch.",
    priceInKobo: 3_500_000,
    currency,
    features: ["Design + build", "Mobile-first", "1 week turnaround"],
  },
  {
    id: "web-app-mvp",
    name: "Web App MVP",
    category: "Development",
    description: "A small product or web app built end to end, ready to ship.",
    priceInKobo: 35_000_000,
    currency,
    features: ["Scoping call", "Design + build + QA", "4–6 week delivery"],
  },
  {
    id: "brand-ui-kit",
    name: "Brand & UI Kit",
    category: "Design",
    description: "Logo, color and type system, and a core set of UI components.",
    priceInKobo: 4_500_000,
    currency,
    features: ["Logo + identity", "Design tokens", "Component library"],
  },
  {
    id: "product-design-sprint",
    name: "Product Design Sprint",
    category: "Design",
    description: "A focused two-week sprint designing a specific feature or MVP slice.",
    priceInKobo: 12_000_000,
    currency,
    features: ["Research + wireframes", "High-fidelity UI", "Dev-ready handoff"],
  },
  {
    id: "startup-advisory",
    name: "Startup Advisory Session",
    category: "Business",
    description:
      "A working session on product strategy, positioning, or go-to-market.",
    priceInKobo: 1_200_000,
    currency,
    features: ["90-minute session", "Written summary", "Follow-up notes"],
  },
];

export const tipPresetAmounts = [500, 1000, 2500, 5000];

export function getPackageById(id: string): ServicePackage | undefined {
  return servicePackages.find((pkg) => pkg.id === id);
}

export function formatPrice(minorUnits: number, currencyCode: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(minorUnits / 100);
}
