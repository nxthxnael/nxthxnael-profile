// Web Development & SEO packages are at founding-client rates; the Design and
// Business packages are still placeholders to review before going live.

export type ServicePackage = {
  id: string;
  name: string;
  category: "Web Development & SEO" | "Design" | "Business";
  description: string;
  priceInKobo: number;
  currency: string;
  features: string[];
  /** "monthly" packages subscribe to the Paystack plan in `planEnvKey`. */
  billing?: "once" | "monthly";
  planEnvKey?: string;
  /** Scoped on a call instead of checked out; the price is a "from" price. */
  bookCall?: boolean;
  /** Build checkout offers Care with the first months free (see webhook). */
  offersCare?: boolean;
  popular?: boolean;
};

export const currency = "KES";

export const servicePackages: ServicePackage[] = [
  {
    id: "starter-site",
    name: "Starter Site",
    category: "Web Development & SEO",
    description: "A one-page site that gets a solo or side business online fast.",
    priceInKobo: 1_500_000,
    currency,
    offersCare: true,
    features: [
      "1-page site, mobile-first",
      "Contact / WhatsApp button",
      "Basic on-page SEO",
      "1 revision round, ~1 week",
    ],
  },
  {
    id: "business-site",
    name: "Business Site",
    category: "Web Development & SEO",
    description: "A multi-page site for a small business that wants to be found.",
    priceInKobo: 4_000_000,
    currency,
    offersCare: true,
    popular: true,
    features: [
      "Up to 5 pages",
      "Simple blog or gallery",
      "Google Maps, Search Console & analytics",
      "2 revision rounds, ~2 weeks",
    ],
  },
  {
    id: "custom-build",
    name: "Custom Build",
    category: "Web Development & SEO",
    description: "Online shops, bookings, or a small web app, scoped on a free call.",
    priceInKobo: 6_000_000,
    currency,
    bookCall: true,
    features: [
      "Paystack / M-Pesa payments",
      "Logins and dashboards",
      "Quoted after a free call",
    ],
  },
  {
    id: "site-seo-audit",
    name: "Website & SEO Audit",
    category: "Web Development & SEO",
    description: "A review of your current site's speed, SEO, and bugs, with quick wins.",
    priceInKobo: 400_000,
    currency,
    features: ["Speed + SEO check", "Written report", "Top fixes prioritized"],
  },
  {
    id: "care-plan",
    name: "Care",
    category: "Web Development & SEO",
    description: "Hosting and upkeep so your site stays fast, secure, and online.",
    priceInKobo: 300_000,
    currency,
    billing: "monthly",
    planEnvKey: "PAYSTACK_PLAN_CARE",
    features: [
      "Hosting, domain & SSL renewals handled",
      "Updates, backups, uptime monitoring",
      "Small text/image edits (~30 min)",
      "72h response",
    ],
  },
  {
    id: "grow-plan",
    name: "Grow",
    category: "Web Development & SEO",
    description: "Everything in Care, plus regular changes and SEO to keep growing.",
    priceInKobo: 700_000,
    currency,
    billing: "monthly",
    planEnvKey: "PAYSTACK_PLAN_GROW",
    popular: true,
    features: [
      "Everything in Care",
      "2–3 hrs of changes a month",
      "Monthly traffic & SEO report",
      "48h response, 3-month minimum",
    ],
  },
  {
    id: "partner-plan",
    name: "Partner",
    category: "Web Development & SEO",
    description: "Everything in Grow, plus ongoing design and development time.",
    priceInKobo: 1_000_000,
    currency,
    billing: "monthly",
    bookCall: true,
    features: [
      "Everything in Grow",
      "~6–8 hrs of dev/design a month",
      "New sections and features",
      "Monthly check-in call",
    ],
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

export const freeCareMonths = 2;

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
