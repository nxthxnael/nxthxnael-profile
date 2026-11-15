import assert from "node:assert/strict";
import { test } from "node:test";
import { isSessionExpired } from "../src/lib/session.ts";

const signedIn = Date.parse("2026-11-15T08:00:00.000Z") / 1000;
const amr = [{ method: "otp", timestamp: signedIn }];
const at = (iso: string) => Date.parse(iso);

test("a session is valid for 12 hours after its own sign-in", () => {
  assert.equal(isSessionExpired(amr, at("2026-11-15T08:01:00.000Z")), false);
  assert.equal(isSessionExpired(amr, at("2026-11-15T20:00:00.000Z")), false);
});

test("a session expires after 12 hours", () => {
  assert.equal(isSessionExpired(amr, at("2026-11-15T20:00:01.000Z")), true);
});

test("the earliest sign-in in the session counts, so a later step cannot extend it", () => {
  const stepped = [...amr, { method: "totp", timestamp: signedIn + 6 * 3600 }];
  assert.equal(isSessionExpired(stepped, at("2026-11-15T20:00:01.000Z")), true);
});

test("an unknown sign-in time counts as expired", () => {
  assert.equal(isSessionExpired(undefined), true);
  assert.equal(isSessionExpired([]), true);
  assert.equal(isSessionExpired(["otp"]), true);
});
