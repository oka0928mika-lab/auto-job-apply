import { chromium } from "playwright";
import { config } from "./config.js";
import { decodeStorageState } from "./storage-state.js";
import { evaluateJob } from "./filter.js";
import { buildProposal } from "./proposal.js";
import { notifyLine } from "./line.js";
import { CrowdWorksAdapter } from "./adapters/crowdworks.js";
import { CoconalaAdapter } from "./adapters/coconala.js";

async function runService(browser, Service, encodedState, key) {
  if (!encodedState) {
    console.log(`[${key}] ログイン情報未設定のためスキップ`);
    return;
  }
  const storageState = await decodeStorageState(encodedState, key);
  const context = await browser.newContext({ storageState, locale: "ja-JP", timezoneId: "Asia/Tokyo" });
  const page = await context.newPage();
  const service = new Service(page);
  try {
    const replies = await service.unreadReplies();
    for (const reply of replies) {
      await notifyLine(config.lineToken, config.lineUserId, `【${service.name}】返信が届きました\n\n${reply.text}\n\n${reply.url}`);
    }

    const urls = await service.listJobs();
    console.log(`[${service.name}] ${urls.length}件を確認`);
    for (const url of urls) {
      try {
        const job = await service.readJob(url);
        if (job.alreadyApplied) continue;
        const evaluation = evaluateJob(job, config);
        console.log(JSON.stringify({ service: service.name, title: job.title, eligible: evaluation.eligible, reasons: evaluation.reasons, url }));
        if (evaluation.eligible && config.liveApply) {
          await service.apply(job, buildProposal(job, evaluation));
          console.log(`[${service.name}] 応募完了: ${job.title}`);
        }
      } catch (error) {
        console.error(`[${service.name}] 案件処理失敗 ${url}:`, error.message);
      }
    }
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: config.headless });
try {
  await runService(browser, CrowdWorksAdapter, config.crowdworksStorageState, "crowdworks");
  await runService(browser, CoconalaAdapter, config.coconalaStorageState, "coconala");
} finally {
  await browser.close();
}
