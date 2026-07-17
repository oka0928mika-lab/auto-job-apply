import { profile } from "./config.js";

export function buildProposal(job, evaluation) {
  if (!profile) throw new Error("応募プロフィールが未設定です");
  const price = Math.max(job.budget, evaluation.minimumBudget);
  const relevant = profile.experience.join("、");
  return {
    price,
    message: `はじめまして。WEBデザイナーの西村美佳と申します。\n\n募集内容を拝見し、これまでの${relevant}の経験を活かして対応できると考え、応募いたしました。\n\nご依頼内容や目的を丁寧に確認し、ターゲットに伝わりやすいデザインをご提案いたします。Photoshop、Illustrator、Figma、Canva、STUDIO、WordPress等に対応可能です。\n\n提案金額：${price.toLocaleString("ja-JP")}円（税込）\n\nZoomでのお打ち合わせは${profile.zoomAvailability}に対応しております。${profile.otherAvailability}です。\n\n詳細を確認のうえ、納期や制作範囲について柔軟にご相談できれば幸いです。よろしくお願いいたします。`
  };
}
