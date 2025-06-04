import { describe, expect, jest, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";

import { I18n } from "../src/i18n";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteTranslations } from "../src/prerequisites/translations";

describe("PrerequisiteTranslations class", () => {
  test("verify method returns failure for translations that not exist", async () => {
    const spy = spyOn(fsp, "access").mockRejectedValue(new Error("Does not exist"));

    const result = await new PrerequisiteTranslations({
      label: "translations",
      supportedLanguages: { en: "en", es: "es" },
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    spy.mockRestore();
  });

  test("verify method returns success for translations that exists", async () => {
    const spy = spyOn(fsp, "access").mockResolvedValue(undefined);

    const result = await new PrerequisiteTranslations({
      label: "translations",
      supportedLanguages: { en: "en" },
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    spy.mockRestore();
  });

  test("verify method returns failure for inconsistent translations", async () => {
    // @ts-expect-error
    spyOn(process, "exit").mockImplementation(() => {});

    spyOn(I18n.prototype, "getTranslations").mockImplementation(async (language: string) => {
      switch (language) {
        case "en":
          return {
            key1: "English Translation 1",
            key2: "English Translation 2",
          } as any;
        case "es":
          return { key1: "Spanish Translation 1" } as any;
        default:
          return {} as any;
      }
    });

    const result = await new PrerequisiteTranslations({
      label: "translations",
      supportedLanguages: { en: "English", es: "Spanish" },
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    jest.restoreAllMocks();
  });
});
