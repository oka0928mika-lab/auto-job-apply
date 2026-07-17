const truthy = new Set(["1", "true", "yes", "on"]);

export const config = {
  liveApply: truthy.has((process.env.LIVE_APPLY ?? "false").toLowerCase()),
  headless: !truthy.has((process.env.HEADED ?? "false").toLowerCase()),
  maxReviewLowRatings: Number(process.env.MAX_LOW_RATINGS ?? 1),
  minClientRating: Number(process.env.MIN_CLIENT_RATING ?? 4.5),
  lineToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
  lineUserId: process.env.LINE_USER_ID ?? "",
  crowdworksStorageState: process.env.CROWDWORKS_STORAGE_STATE_B64 ?? "",
  coconalaStorageState: process.env.COCONALA_STORAGE_STATE_B64 ?? "",
  budgets: {
    banner: 5000,
    social: 15000,
    flyer_single: 15000,
    flyer_double: 25000,
    sign: 10000,
    card: 10000,
    line_setup: 30000,
    lstep: 50000,
    line_operation: 30000,
    lp_design: 30000,
    lp_build: 50000,
    website: 80000,
    figma: 30000,
    wordpress_fix: 10000
  }
};

function loadProfile() {
  if (!process.env.PROFILE_JSON_B64) return null;
  return JSON.parse(Buffer.from(process.env.PROFILE_JSON_B64, "base64").toString("utf8"));
}

export const profile = loadProfile();
