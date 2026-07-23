import test from "node:test";
import assert from "node:assert/strict";
import { Adapter } from "../src/adapters/base.js";

const adapter = new Adapter(null, "test");

test("万円と千円を円に変換し、上限金額を返す", () => {
  assert.equal(adapter.yen("予算\n1万 円\n〜\n3万 円"), 30000);
  assert.equal(adapter.yen("固定報酬制 5,000円 〜 10,000円"), 10000);
  assert.equal(adapter.yen("5千 円 〜 1万 円"), 10000);
});

test("ココナラ形式の評価を読み取る", () => {
  assert.equal(adapter.rating("adguild\n5.0 （71）\n発注実績"), 5);
});

test("クラウドワークス形式の評価を読み取る", () => {
  assert.equal(adapter.rating("ry1308\n5.0 (1件のレビュー) 本人確認済み"), 5);
});

test("指定した見出しの範囲だけを切り出す", () => {
  const body = "予算\n1万円〜3万円\n募集内容\n本文\n応募者一覧\n別の情報";
  assert.equal(adapter.section(body, "募集内容", ["応募者一覧"]), "本文");
});
