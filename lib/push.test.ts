import { test } from "node:test";
import assert from "node:assert/strict";
import { isGoneStatus } from "./push";

test("isGoneStatus: 404 and 410 mean the subscription is gone", () => {
  assert.equal(isGoneStatus(404), true);
  assert.equal(isGoneStatus(410), true);
});

test("isGoneStatus: other failures keep the subscription", () => {
  assert.equal(isGoneStatus(500), false);
  assert.equal(isGoneStatus(429), false);
  assert.equal(isGoneStatus(undefined), false);
});
