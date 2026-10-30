import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { isValidSignature } from "../src/lib/paystack.ts";
import { getPackageById, servicePackages } from "../src/content/services.ts";

process.env.PAYSTACK_SECRET_KEY = "sk_test_unit";
const body = JSON.stringify({ event: "charge.success" });
const sign = (payload: string, key = "sk_test_unit") =>
  createHmac("sha512", key).update(payload).digest("hex");

test("accepts a correct signature", () => {
  assert.equal(isValidSignature(body, sign(body)), true);
});

test("rejects wrong, tampered, malformed and missing signatures", () => {
  assert.equal(isValidSignature(body, sign(body, "sk_test_other")), false);
  assert.equal(isValidSignature(body + " ", sign(body)), false);
  assert.equal(isValidSignature(body, "abc"), false);
  assert.equal(isValidSignature(body, "not-hex"), false);
  assert.equal(isValidSignature(body, ""), false);
  assert.equal(isValidSignature(body, null), false);
});

test("rejects a valid signature with anything appended", () => {
  // Buffer.from(x, "hex") silently stops at the first non-hex character, so
  // without a strict format check these would decode to the valid digest.
  for (const suffix of ["zz", "0", "g1", " "]) {
    assert.equal(isValidSignature(body, sign(body) + suffix), false, suffix);
  }
});

test("rejects everything when the secret key is unset", () => {
  const signature = sign(body);
  delete process.env.PAYSTACK_SECRET_KEY;
  assert.equal(isValidSignature(body, signature), false);
  process.env.PAYSTACK_SECRET_KEY = "sk_test_unit";
});

test("every package has a unique id and a sane price in minor units", () => {
  const ids = new Set(servicePackages.map((pkg) => pkg.id));
  assert.equal(ids.size, servicePackages.length);

  for (const pkg of servicePackages) {
    assert.ok(Number.isInteger(pkg.priceInKobo), `${pkg.id} price is whole`);
    assert.ok(pkg.priceInKobo > 0, `${pkg.id} price is positive`);
    assert.equal(pkg.priceInKobo % 100, 0, `${pkg.id} price is whole KES`);
    assert.equal(getPackageById(pkg.id), pkg);
  }

  assert.equal(getPackageById("nope"), undefined);
});
