import test from "node:test";
import assert from "node:assert/strict";

process.env.PROFILE_JSON_B64 = Buffer.from(JSON.stringify({
  experience: ["Web制作"],
  zoomAvailability: "平日9:00〜15:30",
  otherAvailability: "その他の時間帯および土日祝は要相談"
})).toString("base64");

const { buildProposal } = await import("../src/proposal.js");

test("案件名・顧客名・税込金額を応募文へ反映する", () => {
  const proposal = buildProposal(
    { title: "女性向けホームページ制作", clientName: "山田", budget: 100000 },
    { category: "website", minimumBudget: 80000 }
  );
  assert.match(proposal.message, /山田様/);
  assert.match(proposal.message, /女性向けホームページ制作/);
  assert.match(proposal.message, /100,000円（税込）/);
  assert.match(proposal.message, /平日9:00〜15:30/);
});
