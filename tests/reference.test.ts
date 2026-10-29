import assert from "node:assert/strict";
import { test } from "node:test";
import { REFERENCE_PATTERN } from "../src/lib/paystack.ts";

// Shapes taken from Paystack's docs and our own refs; not verified against a
// live transaction (the live key was invalid when this was written).
test("accepts Paystack-style references", () => {
  for (const reference of [
    "7PVGX8MEk85tgeEpVDtD",
    "nms6uvr1pl",
    "T685312322670591",
    "ref_test_12345",
    "a-b.c=d_1234",
  ]) {
    assert.ok(REFERENCE_PATTERN.test(reference), reference);
  }
});

test("rejects junk so it never reaches Paystack", () => {
  for (const reference of [
    "",
    "short",
    "x".repeat(65),
    "has space 12",
    "../../etc/passwd",
    "abcdefgh12\n",
    "abc\ndefgh12",
  ]) {
    assert.equal(REFERENCE_PATTERN.test(reference), false, JSON.stringify(reference));
  }
});
