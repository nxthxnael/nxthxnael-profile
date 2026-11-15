import assert from "node:assert/strict";
import { test } from "node:test";
import { safeRedirectPath } from "../src/lib/safe-redirect.ts";

test("keeps paths on this site", () => {
  assert.equal(safeRedirectPath("/work/qrix/client"), "/work/qrix/client");
});

test("rejects anything that could leave the site", () => {
  for (const next of [null, "", "https://evil.com", "//evil.com", "/\\evil.com", "evil.com", "/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/ /evil.com", "/a\\b"]) {
    assert.equal(safeRedirectPath(next), "/", String(next));
  }
});
