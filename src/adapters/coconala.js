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
