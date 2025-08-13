import { describe, expect, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import { I18n } from "../src/i18n.service";
import { PrerequisiteTranslations } from "../src/prerequisites/translations";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

describe("prerequisites - translations", () => {
  test("verify method returns failure for translations that not exist", async () => {
    const fspAccess = spyOn(fsp, "access").mockRejectedValue(new Error("Does not exist"));

    const result = await new PrerequisiteTranslations({
      label: "translations",
      supportedLanguages: {
        en: tools.Language.parse("en"),
        es: tools.Language.parse("es"),
      },
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);

    fspAccess.mockRestore();
  });

  test("verify method returns success for translations that exists", async () => {
    const fspAccess = spyOn(fsp, "access").mockResolvedValue(undefined);

    const result = await new PrerequisiteTranslations({
      label: "translations",
      supportedLanguages: { en: tools.Language.parse("en") },
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);

    fspAccess.mockRestore();
  });

  test("verify method returns failure for inconsistent translations", async () => {
    // @ts-expect-error
    const processExit = spyOn(process, "exit").mockImplementation(() => {});

    const i18nGetTranslations = spyOn(I18n.prototype, "getTranslations").mockImplementation(
      async (language: string) => {
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
      },
    );

    const result = await new PrerequisiteTranslations({
      label: "translations",
      supportedLanguages: {
        en: tools.Language.parse("en"),
        es: tools.Language.parse("en"),
      },
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);

    processExit.mockRestore();
    i18nGetTranslations.mockRestore();
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteTranslations({
      label: "prerequisite",
      enabled: false,
      supportedLanguages: {
        en: tools.Language.parse("en"),
        es: tools.Language.parse("es"),
      },
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
