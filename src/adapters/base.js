export class Adapter {
  constructor(page, name) {
    this.page = page;
    this.name = name;
  }

  async firstText(selectors) {
    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      if (await element.count()) return (await element.innerText()).trim();
    }
    return "";
  }

  yen(text) {
    const values = [...text.matchAll(/([\d,]+)\s*円/g)].map(match => Number(match[1].replaceAll(",", "")));
    return values.length ? Math.max(...values) : NaN;
  }
}
