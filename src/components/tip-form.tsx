"use client";

import { useState } from "react";
import { tipPresetAmounts } from "@/content/services";

export function TipForm() {
  const [preset, setPreset] = useState<number>(tipPresetAmounts[1] ?? 1000);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");

  const selected = custom ? Number(custom) : preset;
  const isValidAmount =
    Number.isFinite(selected) && selected >= 1 && selected <= 1_000_000;

  return (
    <form
      action="/api/checkout"
      method="POST"
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="kind" value="tip" />
      <input type="hidden" name="amount" value={isValidAmount ? selected : ""} />

      <div className="flex flex-wrap gap-2">
        {tipPresetAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => {
              setPreset(amount);
              setCustom("");
            }}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              !custom && preset === amount
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-card-foreground hover:border-accent"
            }`}
          >
            KES {amount.toLocaleString("en-KE")}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="custom-amount" className="text-sm font-medium">
          Or enter a custom amount (KES)
        </label>
        <input
          id="custom-amount"
          type="number"
          min={1}
          max={1000000}
          step="1"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          placeholder="e.g. 1500"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tip-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="tip-email"
          type="email"
          name="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={!isValidAmount}
        className="self-start rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send KES {isValidAmount ? selected.toLocaleString("en-KE") : 0}
      </button>
    </form>
  );
}
