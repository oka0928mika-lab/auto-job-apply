import test from "node:test";
import assert from "node:assert/strict";
import { evaluateJob } from "../src/filter.js";
import { config } from "../src/config.js";

test("条件を満たすチラシ案件を対象にする", () => {
  const result = evaluateJob({ title: "店舗チラシデザイン", description: "片面", budget: 20000, clientVerified: true, clientRating: 4.8, lowRatingCount: 0 }, config);
  assert.equal(result.eligible, true);
  assert.equal(result.category, "flyer_single");
});

test("低評価が多数ある発注者を除外する", () => {
  const result = evaluateJob({ title: "バナー制作", description: "", budget: 10000, clientVerified: true, clientRating: 4.7, lowRatingCount: 3 }, config);
  assert.equal(result.eligible, false);
  assert.match(result.reasons.join(), /低評価/);
});

test("最低予算未満を除外する", () => {
  const result = evaluateJob({ title: "ホームページ制作", description: "", budget: 50000, clientVerified: true, clientRating: 5, lowRatingCount: 0 }, config);
  assert.equal(result.eligible, false);
  assert.match(result.reasons.join(), /予算/);
});
