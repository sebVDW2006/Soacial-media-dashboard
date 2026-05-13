import type {
  Brand,
  SafeSocialAccount,
  SocialAccountSlot,
  SocialAccountType,
  SocialConnectionStatus,
  SocialPlatform,
} from "@/lib/types";

export const SOCIAL_ACCOUNT_SLOTS = [
  {
    key: "ublend-instagram",
    brand: "ublend",
    platform: "instagram",
    account_type: "instagram_business",
    displayName: "uBlend Instagram",
    handle: "@ublend",
  },
  {
    key: "seb-instagram",
    brand: "seb",
    platform: "instagram",
    account_type: "instagram_creator",
    displayName: "Sebastian Instagram",
    handle: "@sebastian",
  },
  {
    key: "ublend-linkedin",
    brand: "ublend",
    platform: "linkedin",
    account_type: "linkedin_page",
    displayName: "uBlend LinkedIn Page",
    handle: "uBlend",
  },
  {
    key: "seb-linkedin",
    brand: "seb",
    platform: "linkedin",
    account_type: "linkedin_member",
    displayName: "Sebastian LinkedIn profile",
    handle: "Sebastian",
  },
] as const satisfies ReadonlyArray<{
  key: string;
  brand: Brand;
  platform: SocialPlatform;
  account_type: SocialAccountType;
  displayName: string;
  handle: string;
}>;

export function brandLabel(brand: Brand) {
  return brand === "ublend" ? "uBlend" : "Sebastian";
}

export function shortBrandLabel(brand: Brand) {
  return brand === "ublend" ? "uBlend" : "Seb";
}

export function platformLabel(platform: SocialPlatform) {
  return platform === "instagram" ? "Instagram" : "LinkedIn";
}

export function accountTypeLabel(accountType: SocialAccountType) {
  const labels: Record<SocialAccountType, string> = {
    instagram_business: "Instagram Business",
    instagram_creator: "Instagram Creator",
    linkedin_page: "LinkedIn Page",
    linkedin_member: "LinkedIn Profile",
  };

  return labels[accountType];
}

export function connectionStatusLabel(status?: SocialConnectionStatus | "not_connected") {
  const labels: Record<SocialConnectionStatus | "not_connected", string> = {
    connected: "Connected",
    expired: "Expired",
    needs_review: "Needs review",
    manual_only: "Manual only",
    not_connected: "Not connected",
  };

  return labels[status ?? "not_connected"];
}

export function analyticsStatusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    not_connected: "Not connected",
    connected: "Connected",
    syncing: "Syncing",
    synced: "Auto-synced",
    failed: "Failed",
    manual: "Manual tracking",
  };

  return labels[status ?? "not_connected"] ?? "Not connected";
}

export function getSocialAccountSlot(key: string) {
  return SOCIAL_ACCOUNT_SLOTS.find((slot) => slot.key === key) ?? null;
}

export function mergeAccountSlots(accounts: SafeSocialAccount[]): SocialAccountSlot[] {
  return SOCIAL_ACCOUNT_SLOTS.map((slot) => ({
    key: slot.key,
    brand: slot.brand,
    platform: slot.platform,
    account_type: slot.account_type,
    displayName: slot.displayName,
    handle: slot.handle,
    account:
      accounts.find(
        (account) =>
          account.brand === slot.brand &&
          account.platform === slot.platform &&
          account.account_type === slot.account_type,
      ) ?? null,
  }));
}

export function inferPlatformFromChannel(channelSlug: string, channelName: string): SocialPlatform | null {
  const haystack = `${channelSlug} ${channelName}`.toLowerCase();

  if (haystack.includes("instagram")) return "instagram";
  if (haystack.includes("linkedin")) return "linkedin";

  return null;
}

export function isSyncableAccount(account?: SafeSocialAccount | null) {
  return Boolean(account && account.connection_status === "connected");
}

