import { Adapter } from "./base.js";

export class CoconalaAdapter extends Adapter {
  constructor(page) { super(page, "ココナラ"); }

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
    const ratingMatch = body.match(/評価[^\d]*(\d(?:\.\d+)?)/);
    const lowRatings = [...body.matchAll(/(?:★|評価)\s*([12](?:\.\d+)?)/g)].length;
    return {
      url,
      title: await this.firstText(["h1"]),
      description: body,
      budget: this.yen(body),
      clientVerified: /本人確認済み|本人確認/.test(body),
      clientRating: ratingMatch ? Number(ratingMatch[1]) : NaN,
      lowRatingCount: lowRatings,
      alreadyApplied: /提案済み|応募済み/.test(body)
    };
  }

  async apply(job, proposal) {
    await this.page.goto(job.url, { waitUntil: "domcontentloaded" });
    const button = this.page.getByRole("link", { name: /提案する|応募する/ }).or(this.page.getByRole("button", { name: /提案する|応募する/ })).first();
    if (!(await button.count())) throw new Error("提案ボタンが見つかりません");
    await button.click();
    await this.page.locator("textarea").first().fill(proposal.message);
    const amount = this.page.locator('input[name*="amount"], input[name*="price"], input[inputmode="numeric"]').first();
    if (await amount.count()) await amount.fill(String(proposal.price));
    await this.page.getByRole("button", { name: /確認|次へ|提案する/ }).first().click();
    const finalButton = this.page.getByRole("button", { name: /提案する|送信する|確定/ }).first();
    if (await finalButton.count()) await finalButton.click();
  }

  async unreadReplies() {
    await this.page.goto("https://coconala.com/mypage/user_messages", { waitUntil: "domcontentloaded" });
    return this.page.locator(".unread, [class*=unread]").evaluateAll(nodes => nodes.map(node => ({ text: node.innerText.trim(), url: node.querySelector("a")?.href ?? location.href })));
  }
}
