import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { contactEmail, socials } from "@/content/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk."
        description="Have a project, a question, or just want to say hi? Reach out."
      />

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-3xl gap-12 sm:grid-cols-[1.4fr_1fr]">
          <ContactForm />

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                Email
              </h2>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-1 block text-sm text-foreground transition-colors hover:text-accent"
              >
                {contactEmail}
              </a>
            </div>

            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                Elsewhere
              </h2>
              <ul className="mt-1 flex flex-col gap-1">
                {socials.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-foreground transition-colors hover:text-accent"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
