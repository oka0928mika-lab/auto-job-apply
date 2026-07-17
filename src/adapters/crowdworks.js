import { Adapter } from "./base.js";

export class CrowdWorksAdapter extends Adapter {
  constructor(page) { super(page, "クラウドワークス"); }

  async listJobs() {
    await this.page.goto("https://crowdworks.jp/public/jobs/search?category_id=230&order=new", { waitUntil: "domcontentloaded" });
    const links = await this.page.locator('a[href*="/public/jobs/"]').evaluateAll(nodes =>
      [...new Set(nodes.map(node => node.href).filter(href => /\/public\/jobs\/\d+/.test(href)))]
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
      title: await this.firstText(["h1", ".job_offer_title"]),
      description: body,
      budget: this.yen(body),
      clientVerified: /本人確認済み/.test(body),
      clientRating: ratingMatch ? Number(ratingMatch[1]) : NaN,
      lowRatingCount: lowRatings,
      alreadyApplied: /応募済み|提案済み/.test(body)
    };
  }

  async apply(job, proposal) {
    await this.page.goto(job.url, { waitUntil: "domcontentloaded" });
    const applyLink = this.page.getByRole("link", { name: /応募|仕事に応募/ }).first();
    if (!(await applyLink.count())) throw new Error("応募ボタンが見つかりません");
    await applyLink.click();
    await this.page.locator('textarea[name*="message"], textarea').first().fill(proposal.message);
    const amount = this.page.locator('input[name*="amount"], input[name*="price"], input[inputmode="numeric"]').first();
    if (await amount.count()) await amount.fill(String(proposal.price));
    await this.page.getByRole("button", { name: /応募する|確認画面|次へ/ }).first().click();
    const finalButton = this.page.getByRole("button", { name: /応募する|送信する|確定/ }).first();
    if (await finalButton.count()) await finalButton.click();
  }

  async unreadReplies() {
    await this.page.goto("https://crowdworks.jp/messages", { waitUntil: "domcontentloaded" });
    return this.page.locator(".unread, [class*=unread]").evaluateAll(nodes => nodes.map(node => ({ text: node.innerText.trim(), url: node.querySelector("a")?.href ?? location.href })));
  }
}
