import assert from "node:assert/strict";
import { test } from "node:test";
import { siteUrl } from "../src/lib/site.ts";

test("keeps the origin of a valid site url", () => {
  assert.equal(siteUrl("https://nxthxnael.dev/"), "https://nxthxnael.dev");
  assert.equal(siteUrl("https://nxthxnael.dev/some/path?x=1"), "https://nxthxnael.dev");
  assert.equal(siteUrl("http://localhost:3000"), "http://localhost:3000");
});

test("rejects anything that is not https or local http", () => {
  for (const value of [undefined, "", "nxthxnael.dev", "/work", "http://evil.com", "javascript:alert(1)", "ftp://nxthxnael.dev"]) {
    assert.equal(siteUrl(value), null, String(value));
  }
});
