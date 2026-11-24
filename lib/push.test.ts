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

import { isAllowedPushEndpoint } from "./push";

test("isAllowedPushEndpoint accepts the real browser push services", () => {
  for (const url of [
    "https://fcm.googleapis.com/fcm/send/abc",
    "https://web.push.apple.com/QGx",
    "https://api.push.apple.com/3/device/x",
    "https://updates.push.services.mozilla.com/wpush/v2/x",
    "https://db5p.notify.windows.com/w/?token=x",
  ]) {
    assert.equal(isAllowedPushEndpoint(url), true, url);
  }
});

test("isAllowedPushEndpoint rejects arbitrary hosts, http and look-alikes", () => {
  for (const url of [
    "https://evil.example.com/hang",
    "http://fcm.googleapis.com/fcm/send/abc",
    "https://fcm.googleapis.com.evil.com/x",
    "https://evilpush.apple.com/x",
    "not a url",
  ]) {
    assert.equal(isAllowedPushEndpoint(url), false, url);
  }
});
