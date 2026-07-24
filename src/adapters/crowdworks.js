import { Adapter } from "./base.js";

export class CrowdWorksAdapter extends Adapter {
  constructor(page) { super(page, "クラウドワークス"); }

  async listJobs() {
    const categoryIds = [14, 15, 17, 18, 26, 30, 31, 32, 33, 98, 120, 285];
    const links = new Set();
    for (const categoryId of categoryIds) {
      await this.page.goto(`https://crowdworks.jp/public/jobs/category/${categoryId}?order=new`, {
        waitUntil: "domcontentloaded"
      });
      await this.page.waitForTimeout(1500);
      const pageLinks = await this.page.locator("a[href]").evaluateAll(nodes =>
        nodes
          .map(node => node.href)
          .filter(href => /\/public\/jobs\/\d+(?:\/|$|[?#])/.test(href))
      );
      pageLinks.forEach(link => links.add(link.split(/[?#]/)[0]));
    }
    return [...links].slice(0, 100);
  }

  async readJob(url) {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    const body = await this.page.locator("body").innerText();
    const overview = this.section(body, "仕事の概要", ["仕事の詳細", "クライアント情報"]);
    const details = this.section(body, "仕事の詳細", ["クライアント情報", "最近応募した"]);
    const client = this.section(body, "クライアント情報", ["最近応募した", "この仕事に応募した"]);
    const clientText = client || body.slice(0, 2500);
    const lowRatings = [...clientText.matchAll(/(?:★|評価)\s*([12](?:\.\d+)?)/g)].length;
    return {
      url,
      title: await this.firstText(["h1", ".job_offer_title"]),
      clientName: await this.firstText([
        'a[href*="/public/employers/"]',
        'a[href*="/user/"]',
        '.client-name',
        '[class*="client_name"]'
      ]),
      description: details || body,
      budget: this.yen(overview || body.slice(0, 4000)),
      clientVerified: /本人確認済み|本人確認済/.test(clientText),
      clientRating: this.rating(clientText),
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
