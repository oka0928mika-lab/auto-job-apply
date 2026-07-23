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
    const values = [...text.matchAll(/([\d,.]+)\s*(万|千)?\s*円/g)].map(match => {
      const value = Number(match[1].replaceAll(",", ""));
      const multiplier = match[2] === "万" ? 10000 : match[2] === "千" ? 1000 : 1;
      return value * multiplier;
    });
    return values.length ? Math.max(...values) : NaN;
  }

  section(text, start, ends) {
    const startAt = text.indexOf(start);
    if (startAt < 0) return "";
    const contentStart = startAt + start.length;
    const endAt = ends
      .map(marker => text.indexOf(marker, contentStart))
      .filter(index => index >= 0)
      .sort((a, b) => a - b)[0] ?? text.length;
    return text.slice(contentStart, endAt).trim();
  }

  rating(text) {
    const labelled = text.match(/評価[^\d]*(\d(?:\.\d+)?)/);
    if (labelled) return Number(labelled[1]);
    const reviewed = text.match(/(\d(?:\.\d+)?)\s*[（(]\s*\d+\s*(?:件のレビュー)?\s*[）)]/);
    return reviewed ? Number(reviewed[1]) : NaN;
  }
}
