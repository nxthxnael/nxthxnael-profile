import assert from "node:assert/strict";
import { test } from "node:test";
import { isSessionExpired } from "../src/lib/session.ts";

const signedIn = "2026-11-15T08:00:00.000Z";
const at = (iso: string) => Date.parse(iso);

test("a session is valid for 12 hours after sign-in", () => {
  assert.equal(isSessionExpired(signedIn, at("2026-11-15T08:01:00.000Z")), false);
  assert.equal(isSessionExpired(signedIn, at("2026-11-15T20:00:00.000Z")), false);
});

test("a session expires after 12 hours", () => {
  assert.equal(isSessionExpired(signedIn, at("2026-11-15T20:00:01.000Z")), true);
});

test("an unknown sign-in time counts as expired", () => {
  assert.equal(isSessionExpired(undefined), true);
  assert.equal(isSessionExpired("not a date"), true);
});
