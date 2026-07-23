import { profile } from "./config.js";

const categoryDetails = {
  lstep: { work: "Lステップ構築・運用", strength: "公式LINE・Lステップの設計、構築、運用", days: 30 },
  line_operation: { work: "公式LINE運用", strength: "公式LINEの配信設計、画像制作、運用改善", days: 30 },
  line_setup: { work: "公式LINE構築", strength: "公式LINEの導線設計、初期構築、クリエイティブ制作", days: 30 },
  lp_build: { work: "ランディングページ制作", strength: "目的に沿ったLPデザインと構築", days: 30 },
  lp_design: { work: "ランディングページデザイン", strength: "ターゲットと目的に合わせたLPデザイン", days: 21 },
  website: { work: "ホームページ制作", strength: "STUDIO・WordPressを使用したホームページ制作", days: 30 },
  wordpress_fix: { work: "WordPress修正・更新", strength: "WordPressサイトの修正、更新、デザイン調整", days: 14 },
  figma: { work: "Figmaデザイン制作", strength: "Figmaを使用したWebデザイン・デザインカンプ制作", days: 21 },
  flyer_double: { work: "両面チラシデザイン", strength: "目的とターゲットに合わせたチラシデザイン", days: 14 },
  flyer_single: { work: "チラシデザイン", strength: "目的とターゲットに合わせたチラシデザイン", days: 10 },
  sign: { work: "看板・サインデザイン", strength: "視認性と導線を意識した看板・サインデザイン", days: 14 },
  card: { work: "名刺・カードデザイン", strength: "ブランドイメージに合わせた名刺・カードデザイン", days: 10 },
  social: { work: "SNS投稿画像制作", strength: "訴求内容が伝わるSNSクリエイティブ制作", days: 14 },
  banner: { work: "バナーデザイン", strength: "目的とターゲットに合わせたバナーデザイン", days: 7 }
};

function honorific(name) {
  const value = (name ?? "").trim().replace(/様$/, "");
  return value ? `${value}様` : "ご担当者様";
}

export function buildProposal(job, evaluation) {
  if (!profile) throw new Error("応募プロフィールが未設定です");

  const detail = categoryDetails[evaluation.category] ?? {
    work: job.title || "デザイン制作",
    strength: "Web・グラフィックデザイン制作",
    days: 30
  };
  const price = Math.max(job.budget, evaluation.minimumBudget);
  const client = honorific(job.clientName);

  return {
    price,
    message: `${client}

初めまして。
愛知県在住のWEBデザイナー、西村美佳と申します。

「${job.title}」の案件内容を拝見し、応募いたしました。
今回のご依頼は、私が得意としている${detail.strength}の経験を活かして、ご要望に沿った制作ができると考えております。

良いものを制作することはもちろん、以下の点も大切にしています。

・デザイン完成をお待ちいただくクライアント様のお気持ちを考えること
・丁寧でスムーズなコミュニケーション
・迅速な返信と進捗共有
・納期を厳守し、安心して任せていただける対応

ご依頼いただけましたら、今回限りではなく、長くお付き合いいただける関係を築きながら、事業の成長に貢献できるよう尽力いたします。

ポートフォリオはこちらをご覧ください。
https://fori.io/aomika-design

●お見積り
内容：${detail.work}
想定制作期間：${detail.days}日（修正対応を含む）
金額：${price.toLocaleString("ja-JP")}円（税込）

●納期
すぐに対応可能です。
ご希望の日程がございましたら、お申し付けください。

【画像について】
掲載したい画像がございましたら、ご共有ください。
特にご指定がない場合は、無料素材サイトから選定いたします。
有料素材を使用する場合は、事前にご相談のうえ、素材費をご負担いただきます。

＝＝＝ご連絡について＝＝＝
ご質問やご不明点がございましたら、迅速に対応いたします。
できる限り早い返信を心がけておりますが、作業状況により少しお時間をいただく場合がございます。

オンラインミーティングは、Zoom・Google Meetに対応可能です。
Zoomでのお打ち合わせは${profile.zoomAvailability}、${profile.otherAvailability}です。
外部連絡ツールはChatworkに対応しております。
＝＝＝＝＝＝＝＝＝＝＝＝

それでは、本件につきましてご検討のほどよろしくお願いいたします。
${client}のお力になれますことを、心より願っております。

〈自己紹介〉
名前：西村美佳
在住地：愛知県
趣味：漫画を読むこと

自己紹介資料
https://canva.link/rodw0ocxgvyra8i

【現在の業務内容】
印刷物：チラシ、ポスター、看板、名刺、カード
Web：広告バナー、SNS画像、ランディングページ、ホームページ、公式LINE・Lステップ

クライアント様のイメージに合ったデザインと、目的に合わせた成果につながるデザインを心がけています。

【得意なこと】
女性向けデザイン
ロゴ・バナー・チラシ・パンフレット制作
LP・ホームページ制作
公式LINE・Lステップの構築と運用

【使用ツール】
Figma、Photoshop、Illustrator、Canva、STUDIO、WordPress

最後までご覧いただき、ありがとうございました。
ご要望をしっかりとヒアリングし、理想的なものを一緒に制作できれば幸いです。
ご検討のほど、よろしくお願いいたします。`
  };
}
