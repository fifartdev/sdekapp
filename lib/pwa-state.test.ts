import { test } from "node:test";
import assert from "node:assert/strict";
import { decidePrompt, type PwaEnv } from "./pwa-state";

const base: PwaEnv = {
  isMobile: true,
  isIos: false,
  isStandalone: false,
  hasInstallPrompt: false,
  pushSupported: true,
  permission: "default",
  subscribed: false,
  loggedIn: true,
  dismissed: false,
};

test("desktop never shows the banner", () => {
  assert.equal(decidePrompt({ ...base, isMobile: false, hasInstallPrompt: true }), "none");
});

test("dismissed hides the banner", () => {
  assert.equal(decidePrompt({ ...base, isIos: true, dismissed: true }), "none");
});

test("iOS Safari, not installed: install instructions, not notifications", () => {
  assert.equal(decidePrompt({ ...base, isIos: true, pushSupported: false }), "install-ios");
  assert.equal(decidePrompt({ ...base, isIos: true }), "install-ios");
});

test("Android with install prompt: install button", () => {
  assert.equal(decidePrompt({ ...base, hasInstallPrompt: true }), "install-android");
});

test("installed iOS, logged in, not yet asked: enable notifications", () => {
  assert.equal(decidePrompt({ ...base, isIos: true, isStandalone: true }), "enable-notifications");
});

test("Android browser without install prompt (e.g. already installed elsewhere): enable notifications", () => {
  assert.equal(decidePrompt(base), "enable-notifications");
});

test("permission denied: nothing to offer", () => {
  assert.equal(decidePrompt({ ...base, isStandalone: true, permission: "denied" }), "none");
});

test("logged out and installed: nothing", () => {
  assert.equal(decidePrompt({ ...base, isStandalone: true, loggedIn: false }), "none");
});

test("already subscribed: nothing", () => {
  assert.equal(decidePrompt({ ...base, isStandalone: true, subscribed: true, permission: "granted" }), "none");
});
