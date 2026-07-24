import { Adapter } from "./base.js";

export class CoconalaAdapter extends Adapter {
  constructor(page) { super(page, "ココナラ"); }

  async clickAction(pattern, errorMessage) {
    const candidates = this.page.locator(
      'button, input[type="submit"], input[type="button"], a[role="button"], form a'
    );
    const count = await candidates.count();
    for (let index = 0; index < count; index += 1) {
      const candidate = candidates.nth(index);
      if (!(await candidate.isVisible().catch(() => false))) continue;
      const label = [
        await candidate.innerText().catch(() => ""),
        await candidate.getAttribute("value") ?? "",
        await candidate.getAttribute("aria-label") ?? ""
      ].join(" ").trim();
      if (pattern.test(label)) {
        await candidate.click();
        return;
      }
    }
    throw new Error(errorMessage);
  }

  async listJobs() {
    await this.page.goto("https://coconala.com/requests/categories/18", { waitUntil: "domcontentloaded" });
    const links = await this.page.locator('a[href*="/requests/"]').evaluateAll(nodes =>
      [...new Set(nodes.map(node => node.href).filter(href => /\/requests\/\d+/.test(href)))]
    );
    return links.slice(0, 100);
  }

  async readJob(url) {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    const body = await this.page.locator("body").innerText();
    const overview = this.section(body, "予算", ["募集内容", "募集内容の追記"]);
    const details = this.section(body, "募集内容", ["募集内容の追記", "応募者一覧"]);
    const client = this.section(body, "募集者情報", ["この募集内容に似ている仕事"]);
    const clientLines = client.split("\n").map(line => line.trim()).filter(Boolean);
    const clientName = clientLines.find(line =>
      !/^\d(?:\.\d+)?\s*[（(]/.test(line) &&
      !/^(発注実績|発注件数|発注率|取引完了率|認証状況|本人確認|機密保持契約)/.test(line) &&
      !/^\d+%?$/.test(line)
    ) ?? "";
    const lowRatings = [...client.matchAll(/(?:★|評価)\s*([12](?:\.\d+)?)/g)].length;
    return {
      url,
      title: await this.firstText(["h1"]),
      clientName,
      description: details || body,
      budget: this.yen(overview || body.slice(0, 2500)),
      clientVerified: /認証状況[\s\S]*本人確認/.test(client),
      clientRating: this.rating(client),
      lowRatingCount: lowRatings,
      alreadyApplied: /提案済み|応募済み|募集終了|受付終了|応募期限を過ぎ/.test(body)
    };
  }

  async apply(job, proposal) {
    await this.page.goto(job.url, { waitUntil: "domcontentloaded" });
    await this.clickAction(/提案する|応募する/, "提案ボタンが見つかりません");
    const message = this.page.locator("textarea").first();
    await message.waitFor({ state: "visible" });
    await message.fill(proposal.message);
    const amount = this.page.locator('input[name*="amount"], input[name*="price"], input[inputmode="numeric"]').first();
    if (await amount.count()) await amount.fill(String(proposal.price));
    await this.clickAction(
      /確認(?:画面)?(?:へ|に)?(?:進む)?|次へ|内容を確認|提案内容を確認/,
      "応募内容の確認ボタンが見つかりません"
    );
    await this.page.waitForLoadState("domcontentloaded").catch(() => {});
    await this.clickAction(
      /提案する|応募する|送信する|確定する/,
      "最終送信ボタンが見つかりません"
    );
  }

  async unreadReplies() {
    await this.page.goto("https://coconala.com/mypage/user_messages", { waitUntil: "domcontentloaded" });
    return this.page.locator(".unread, [class*=unread]").evaluateAll(nodes => nodes.map(node => ({ text: node.innerText.trim(), url: node.querySelector("a")?.href ?? location.href })));
  }
}
