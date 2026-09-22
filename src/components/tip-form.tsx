"use client";

import { useState } from "react";
import { tipPresetAmounts } from "@/content/services";

export function TipForm() {
  const [preset, setPreset] = useState<number>(tipPresetAmounts[1] ?? 10);
  const [custom, setCustom] = useState("");

  const selected = custom ? Number(custom) : preset;
  const isValid = Number.isFinite(selected) && selected >= 1 && selected <= 10000;

  return (
    <form
      action="/api/checkout"
      method="POST"
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="kind" value="tip" />
      <input type="hidden" name="amount" value={isValid ? selected : ""} />

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
            ${amount}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="custom-amount" className="text-sm font-medium">
          Or enter a custom amount (USD)
        </label>
        <input
          id="custom-amount"
          type="number"
          min={1}
          max={10000}
          step="1"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          placeholder="e.g. 15"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="self-start rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send ${isValid ? selected : 0}
      </button>
    </form>
  );
}
