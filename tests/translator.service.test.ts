import { describe, expect, test } from "bun:test";
import { TranslatorService } from "../src/translator.service";

const translations = { greeting: "Hello", welcome: "Welcome, {{name}}!" };

const t = TranslatorService.use(translations);

describe("TranslatorService", () => {
  test("use", () => {
    expect(t("greeting")).toEqual("Hello");
  });

  test("use - placeholder", () => {
    expect(t("welcome", { name: "John" })).toEqual("Welcome, John!");
  });

  test("use - passthrough", () => {
    expect(t("missing")).toEqual("missing");
  });
});
