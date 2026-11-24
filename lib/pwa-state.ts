export type PwaEnv = {
  isMobile: boolean;
  isIos: boolean;
  isStandalone: boolean;
  hasInstallPrompt: boolean;
  pushSupported: boolean;
  permission: "default" | "granted" | "denied";
  subscribed: boolean;
  loggedIn: boolean;
  dismissed: boolean;
};

export type PromptView = "none" | "install-android" | "install-ios" | "enable-notifications";

/**
 * A device subscription outlives the login: re-claim it for whoever is signed in now
 * (another user may have enabled it on this device, or the server row may be gone).
 */
export function needsResync(s: { loggedIn: boolean; permission: string; hasSubscription: boolean }): boolean {
  return s.loggedIn && s.permission === "granted" && s.hasSubscription;
}

/** Which banner (if any) a phone visitor should see. */
export function decidePrompt(env: PwaEnv): PromptView {
  if (env.dismissed || !env.isMobile) return "none";
  if (!env.isStandalone && env.isIos) return "install-ios";
  if (!env.isStandalone && env.hasInstallPrompt) return "install-android";
  if (
    env.loggedIn &&
    env.pushSupported &&
    env.permission === "default" &&
    !env.subscribed &&
    (env.isStandalone || !env.isIos)
  ) {
    return "enable-notifications";
  }
  return "none";
}
