import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Blog" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-6">
        <Link
          href="/"
          className="shrink-0 text-sm font-semibold tracking-tight"
        >
          nxthxnael
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto text-xs text-muted-foreground sm:gap-6 sm:text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
