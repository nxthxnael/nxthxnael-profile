import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { servicePackages, formatPrice, type ServicePackage } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website builds, monthly care plans, and SEO, plus design and business services.",
};

const categories: ServicePackage["category"][] = [
  "Web Development & SEO",
  "Design",
  "Business",
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Work with me."
        description="A few fixed-scope ways to work together."
      />

      {categories.map((category) => {
        const packages = servicePackages.filter(
          (pkg) => pkg.category === category,
        );
        if (packages.length === 0) return null;

        const builds = packages.filter((pkg) => pkg.billing !== "monthly");
        const plans = packages.filter((pkg) => pkg.billing === "monthly");

        return (
          <section key={category} className="border-t border-border px-6 py-16">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {category}
              </h2>
              {plans.length > 0 ? (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Founding rates for my first 5 clients. Every build comes with
                  the first 2 months of Care free.
                </p>
              ) : null}

              {plans.length > 0 ? (
                <h3 className="mt-8 text-sm font-medium text-muted-foreground">
                  Build a site
                </h3>
              ) : null}
              <PackageGrid packages={builds} />

              {plans.length > 0 ? (
                <>
                  <h3 className="mt-12 text-sm font-medium text-muted-foreground">
                    Monthly care plans
                  </h3>
                  <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
                    Billed monthly; cancel any time after any minimum term. Unused hours don&apos;t
                    roll over; extra work is quoted separately.
                  </p>
                  <PackageGrid packages={plans} />
                </>
              ) : null}
            </div>
          </section>
        );
      })}
    </>
  );
}

function PackageGrid({ packages }: { packages: ServicePackage[] }) {
  return (
    <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}

function PackageCard({ pkg }: { pkg: ServicePackage }) {
  const price = formatPrice(pkg.priceInKobo, pkg.currency);

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-card p-6 ${
        pkg.popular ? "border-accent" : "border-border"
      }`}
    >
      <div>
        {pkg.popular ? (
          <p className="mb-2 text-xs font-medium text-accent">Most popular</p>
        ) : null}
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-medium text-card-foreground">{pkg.name}</h4>
          <span className="shrink-0 text-sm font-semibold text-foreground">
            {pkg.bookCall ? `from ${price}` : price}
            {pkg.billing === "monthly" ? (
              <span className="font-normal text-muted-foreground">/mo</span>
            ) : null}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>
        <ul className="mt-4 flex flex-col gap-1.5">
          {pkg.features.map((feature) => (
            <li key={feature} className="text-xs text-muted-foreground">
              · {feature}
            </li>
          ))}
        </ul>
      </div>

      {pkg.bookCall ? (
        <Link
          href="/contact"
          className="mt-6 rounded-full border border-border px-5 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Book a call
        </Link>
      ) : (
        <form
          action="/api/checkout"
          method="POST"
          className="mt-6 flex flex-col gap-2"
        >
          <input type="hidden" name="kind" value="package" />
          <input type="hidden" name="packageId" value={pkg.id} />
          <input
            type="email"
            name="email"
            required
            aria-label="Email address"
            placeholder="you@example.com"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            {pkg.billing === "monthly" ? "Subscribe" : "Book this"}
          </button>
        </form>
      )}
    </div>
  );
}
