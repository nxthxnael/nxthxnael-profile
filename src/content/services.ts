// Placeholder packages — replace with your real offers and pricing.

export type ServicePackage = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  features: string[];
};

export const servicePackages: ServicePackage[] = [
  {
    id: "starter-build",
    name: "Starter Build",
    description: "A small, well-scoped product or landing page, design to launch.",
    priceInCents: 150000,
    currency: "usd",
    features: ["Up to 5 pages", "Design + build", "2 weeks turnaround"],
  },
  {
    id: "product-sprint",
    name: "Product Sprint",
    description: "A focused two-week sprint on a specific feature or MVP slice.",
    priceInCents: 400000,
    currency: "usd",
    features: ["Scoping call", "Design + build + QA", "Async daily updates"],
  },
  {
    id: "design-audit",
    name: "Design Audit",
    description: "A review of your product's UX/UI with concrete recommendations.",
    priceInCents: 60000,
    currency: "usd",
    features: ["Full product walkthrough", "Written report", "Follow-up call"],
  },
];

export const tipPresetAmounts = [5, 10, 25, 50];

export function getPackageById(id: string): ServicePackage | undefined {
  return servicePackages.find((pkg) => pkg.id === id);
}

export function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
