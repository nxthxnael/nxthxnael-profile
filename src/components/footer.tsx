const socials = [
  { href: "https://github.com/nxthxnael", label: "GitHub" },
  { href: "https://x.com/nxthxnael", label: "X" },
  { href: "https://linkedin.com/in/nxthxnael", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} nxthxnael. All rights reserved.</p>
        <div className="flex items-center gap-4">
          {socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
