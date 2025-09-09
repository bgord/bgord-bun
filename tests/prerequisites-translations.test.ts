import { describe, expect, jest, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import { I18n } from "../src/i18n.service";
import { PrerequisiteTranslations } from "../src/prerequisites/translations";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - translations", () => {
  test("verify method returns success for translations that exists", async () => {
    spyOn(fsp, "access").mockResolvedValue(undefined);

    const result = await new PrerequisiteTranslations({
      label: "i18n",
      supportedLanguages: { en: "en" },
    }).verify();

    expect(result).toEqual(prereqs.Verification.success());
  });

  test("verify method returns failure for translations that not exist", async () => {
    spyOn(fsp, "access").mockRejectedValue(new Error("Does not exist"));

    const result = await new PrerequisiteTranslations({
      label: "translations",
      supportedLanguages: { en: "en", es: "es" },
    }).verify();

    // @ts-expect-error
    expect(result.error.message).toMatch(/Does not exist/);
  });

  test("verify method returns failure for inconsistent translations", async () => {
    // @ts-expect-error
    spyOn(process, "exit").mockImplementation(() => {});
    spyOn(fsp, "access").mockImplementation(jest.fn());

    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          return { key1: "English Translation 1", key2: "English Translation 2" };
        case "es":
          return { key1: "Spanish Translation 1" };
        default:
          return {} as any;
      }
    });

    const result = await new PrerequisiteTranslations({
      label: "translations",
      supportedLanguages: { en: "en", es: "en" },
    }).verify();

    expect(result).toEqual(
      prereqs.Verification.failure({ message: "Key: key2, exists in en, missing in es" }),
    );
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteTranslations({
      label: "prerequisite",
      enabled: false,
      supportedLanguages: { en: "en", es: "es" },
    });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
