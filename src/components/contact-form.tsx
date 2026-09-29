"use client";

import { useState, type FormEvent } from "react";
import { contactEmail } from "@/content/contact";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `Portfolio contact from ${name}`;
    const body = `${message}\n\n— ${name} (${email})`;
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-accent"
        />
        <p className="text-xs text-muted-foreground">
          So I can reply to the right address — your own email app fills in
          the actual sender.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-accent"
        />
      </div>

      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Send message
      </button>
      <p className="text-xs text-muted-foreground">
        Opens your email client with this message pre-filled.
      </p>
    </form>
  );
}
