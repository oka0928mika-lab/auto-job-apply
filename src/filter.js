const categories = [
  { key: "lstep", words: ["lステップ", "エルステップ"] },
  { key: "line_operation", words: ["line運用", "公式line運用", "line公式運用"] },
  { key: "line_setup", words: ["公式line", "line構築", "line公式"] },
  { key: "lp_build", words: ["lp構築", "ランディングページ構築", "lp制作"] },
  { key: "lp_design", words: ["lpデザイン", "ランディングページデザイン"] },
  { key: "website", words: ["ホームページ", "webサイト", "ウェブサイト", "コーポレートサイト"] },
  { key: "wordpress_fix", words: ["wordpress修正", "ワードプレス修正", "wordpress更新"] },
  { key: "figma", words: ["figma", "デザインカンプ"] },
  { key: "flyer_double", words: ["両面チラシ", "チラシ両面"] },
  { key: "flyer_single", words: ["チラシ", "フライヤー"] },
  { key: "sign", words: ["看板", "サインデザイン"] },
  { key: "card", words: ["名刺", "ショップカード", "診察券"] },
  { key: "social", words: ["sns投稿", "instagram投稿", "インスタ投稿", "カルーセル"] },
  { key: "banner", words: ["バナー", "広告画像", "sns画像"] }
];

const excluded = [
  "無償テスト", "無料テスト", "報酬なし", "完全成果報酬", "スクール勧誘",
  "情報商材", "line追加必須", "契約前にline", "仮払い前に作業"
];

export function classifyJob(text) {
  const normalized = text.toLowerCase().replaceAll("ｌ", "l");
  return categories.find(({ words }) => words.some(word => normalized.includes(word)))?.key ?? null;
}

function matchingCategories(text) {
  const normalized = text.toLowerCase().replaceAll("ｌ", "l");
  return categories
    .filter(({ words }) => words.some(word => normalized.includes(word)))
    .map(({ key }) => key);
}

export function evaluateJob(job, settings) {
  const text = `${job.title ?? ""}\n${job.description ?? ""}`.toLowerCase();
  const matches = matchingCategories(text);
  const affordable = matches
    .filter(key => Number.isFinite(job.budget) && job.budget >= settings.budgets[key])
    .sort((a, b) => settings.budgets[b] - settings.budgets[a]);
  const category = affordable[0] ?? matches[0] ?? null;
  const reasons = [];

  if (!category) reasons.push("対象カテゴリ外");
  if (excluded.some(word => text.includes(word))) reasons.push("除外キーワードあり");
  if (job.clientVerified !== true) reasons.push("本人確認未完了");
  if (!Number.isFinite(job.clientRating) || job.clientRating < settings.minClientRating) reasons.push("発注者評価が基準未満");
  if ((job.lowRatingCount ?? 0) > settings.maxReviewLowRatings) reasons.push("低評価レビューが多い");

  const minimum = category ? settings.budgets[category] : Infinity;
  if (!Number.isFinite(job.budget) || job.budget < minimum) reasons.push("予算が最低金額未満");

  return { eligible: reasons.length === 0, category, minimumBudget: minimum, reasons };
}
