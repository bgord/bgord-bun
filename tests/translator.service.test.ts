/* cSpell:disable */
import { describe, expect, test } from "bun:test";
import { TranslatorService } from "../src/translator.service";

const translations = {
  greeting: "Hello",
  welcome: "Welcome, {{name}}!",
  articles: "{{count}} {{count|one=article|other=articles}}",
  named: "{{name}}: {{count}} {{count|one=article|other=articles}}",
};

const plurals = {
  articles: "{{count}} {{count|one=artykuł|few=artykuły|many=artykułów|other=artykułu}}",
  window:
    "{{count}} {{count|one=artykuł|few=artykuły|many=artykułów|other=artykułu}} w {{days}} {{days|one=dniu|other=dniach}}",
  days: "{{days}} {{days|other=dniu}}",
  incomplete: "{{count}} {{count|one=artykuł}}",
};

const t = TranslatorService.use(translations, "en");

const pl = TranslatorService.use(plurals, "pl");

describe("TranslatorService", () => {
  test("use", () => {
    expect(t("greeting")).toEqual("Hello");
  });

  test("use - placeholder", () => {
    expect(t("welcome", { name: "John" })).toEqual("Welcome, John!");
  });

  test("use - special characters in value", () => {
    expect(t("welcome", { name: "$& $$" })).toEqual("Welcome, $& $$!");
  });

  test("use - passthrough", () => {
    expect(t("missing")).toEqual("missing");
  });

  test("use - plural - en", () => {
    expect(t("articles", { count: 1 })).toEqual("1 article");
    expect(t("articles", { count: 2 })).toEqual("2 articles");
    expect(t("articles", { count: 0 })).toEqual("0 articles");
  });

  test("use - plural - pl", () => {
    expect(pl("articles", { count: 1 })).toEqual("1 artykuł");
    expect(pl("articles", { count: 3 })).toEqual("3 artykuły");
    expect(pl("articles", { count: 5 })).toEqual("5 artykułów");
    expect(pl("articles", { count: 22 })).toEqual("22 artykuły");
    expect(pl("articles", { count: 1.5 })).toEqual("1.5 artykułu");
  });

  test("use - plural - string variable", () => {
    expect(pl("articles", { count: "3" })).toEqual("3 artykuły");
  });

  test("use - plural - multiple blocks", () => {
    expect(pl("window", { count: 1, days: 7 })).toEqual("1 artykuł w 7 dniach");
  });

  test("use - plural - falls back to other", () => {
    expect(pl("days", { days: 1 })).toEqual("1 dniu");
  });

  test("use - plural - missing form", () => {
    expect(pl("incomplete", { count: 5 })).toEqual("5 {{count|one=artykuł}}");
  });

  test("use - plural - missing variable", () => {
    expect(pl("articles", { other: 1 })).toEqual(
      "{{count}} {{count|one=artykuł|few=artykuły|many=artykułów|other=artykułu}}",
    );
  });

  test("use - plural - no variables", () => {
    expect(pl("articles")).toEqual(
      "{{count}} {{count|one=artykuł|few=artykuły|many=artykułów|other=artykułu}}",
    );
  });

  test("use - plural - variable value is not parsed", () => {
    expect(t("named", { name: "{{count|one=x|other=y}}", count: 1 })).toEqual(
      "{{count|one=x|other=y}}: 1 article",
    );
  });
});
