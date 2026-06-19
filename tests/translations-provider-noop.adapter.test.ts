import { describe, expect, test } from "bun:test";
import { TranslationsProviderNoopAdapter } from "../src/translations-provider-noop.adapter";

const language = "en";
const translations = { dog: "dog" };
const adapter = new TranslationsProviderNoopAdapter({ [language]: translations });

describe("TranslationsProviderNoopAdapter", () => {
  test("happy path", async () => {
    expect(await adapter.getTranslationsFor(language)).toEqual(translations);
  });
});
