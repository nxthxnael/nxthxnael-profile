import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TipForm } from "@/components/tip-form";
import { servicePackages, formatPrice } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description: "Productized services and ways to support the work.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Work with me."
        description="A few fixed-scope ways to work together, plus a way to just say thanks."
      />

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicePackages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6"
            >
              <div>
                <h3 className="font-medium text-card-foreground">
                  {pkg.name}
                </h3>
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
                className="mt-6 flex items-center justify-between gap-3"
              >
                <input type="hidden" name="kind" value="package" />
                <input type="hidden" name="packageId" value={pkg.id} />
                <span className="text-lg font-semibold text-foreground">
                  {formatPrice(pkg.priceInCents, pkg.currency)}
                </span>
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
      </section>

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
