import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TipForm } from "@/components/tip-form";
import { servicePackages, formatPrice, type ServicePackage } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description: "Productized services and ways to support the work.",
};

const categories: ServicePackage["category"][] = [
  "Development",
  "Design",
  "Business",
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Work with me."
        description="A few fixed-scope ways to work together, plus a way to just say thanks."
      />

      {categories.map((category) => {
        const packages = servicePackages.filter(
          (pkg) => pkg.category === category,
        );
        if (packages.length === 0) return null;

        return (
          <section key={category} className="border-t border-border px-6 py-16">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {category}
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6"
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-medium text-card-foreground">
                          {pkg.name}
                        </h3>
                        <span className="shrink-0 text-sm font-semibold text-foreground">
                          {formatPrice(pkg.priceInKobo, pkg.currency)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {pkg.description}
                      </p>
                      <ul className="mt-4 flex flex-col gap-1.5">
                        {pkg.features.map((feature) => (
                          <li
                            key={feature}
                            className="text-xs text-muted-foreground"
                          >
                            · {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

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
                        placeholder="you@example.com"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
                      >
                        Book this
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-md">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Support the work
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Found something useful? Send a tip — no scope required.
          </p>
          <div className="mt-6">
            <TipForm />
          </div>
        </div>
      </section>
    </>
  );
}
