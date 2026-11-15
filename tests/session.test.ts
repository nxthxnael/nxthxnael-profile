import assert from "node:assert/strict";
import { test } from "node:test";
import { isAuthOutage, isSessionExpired } from "../src/lib/session.ts";

const signedIn = Date.parse("2026-11-15T08:00:00.000Z") / 1000;
const amr = [{ method: "otp", timestamp: signedIn }];
const at = (iso: string) => Date.parse(iso);

test("a session is valid for 12 hours after its own sign-in", () => {
  assert.equal(isSessionExpired(amr, at("2026-11-15T08:01:00.000Z")), false);
  assert.equal(isSessionExpired(amr, at("2026-11-15T19:59:59.000Z")), false);
});

test("a session expires at 12 hours, the same boundary the database uses", () => {
  assert.equal(isSessionExpired(amr, at("2026-11-15T20:00:00.000Z")), true);
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

test("only service failures count as auth outages, not answers about the visitor", () => {
  assert.equal(isAuthOutage(null), false);
  assert.equal(isAuthOutage({ status: 400, name: "AuthSessionMissingError" }), false);
  assert.equal(isAuthOutage({ status: 403, code: "session_not_found" }), false);
  assert.equal(isAuthOutage({ status: 0, name: "AuthRetryableFetchError" }), true);
  assert.equal(isAuthOutage({ status: 503 }), true);
  assert.equal(isAuthOutage(new Error("fetch failed")), true);
});
