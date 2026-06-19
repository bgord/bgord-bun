import { describe, expect, test } from "bun:test";
import { TranslatorService } from "../src/translator.service";

const translations = { greeting: "Hello", welcome: "Welcome, {{name}}!" };

const t = TranslatorService.use(translations);

describe("TranslatorService", () => {
  test("useTranslations", () => {
    expect(t("greeting")).toEqual("Hello");
  });

  test("useTranslations - placeholder", () => {
    expect(t("welcome", { name: "John" })).toEqual("Welcome, John!");
  });

  test("useTranslations - passthrough", () => {
    expect(t("missing")).toEqual("missing");
  });
});
