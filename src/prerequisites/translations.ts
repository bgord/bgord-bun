import { constants } from "node:fs";
import fsp from "node:fs/promises";
import type * as tools from "@bgord/tools";
import * as i18n from "../i18n.service";
import * as prereqs from "../prerequisites.service";

type PrerequisiteTranslationsProblemType = {
  translationKey: i18n.TranslationsKeyType;
  existsInLanguage: tools.LanguageType;
  missingInLanguage: tools.LanguageType;
};

export class PrerequisiteTranslations implements prereqs.Prerequisite {
  readonly kind = "translations";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly translationsPath?: typeof i18n.I18n.DEFAULT_TRANSLATIONS_PATH;
  private readonly supportedLanguages: i18n.I18nConfigType["supportedLanguages"];

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      translationsPath?: typeof i18n.I18n.DEFAULT_TRANSLATIONS_PATH;
      supportedLanguages: i18n.I18nConfigType["supportedLanguages"];
    },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.translationsPath = config.translationsPath;
    this.supportedLanguages = config.supportedLanguages;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    const translationsPath = this.translationsPath ?? i18n.I18n.DEFAULT_TRANSLATIONS_PATH;

    try {
      await fsp.access(translationsPath, constants.R_OK);

      for (const language in this.supportedLanguages) {
        await fsp.access(new i18n.I18n().getTranslationPathForLanguage(language).get(), constants.R_OK);
      }
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }

    const supportedLanguages = Object.keys(this.supportedLanguages);

    if (supportedLanguages.length === 1) return prereqs.Verification.success();

    const languageToTranslationKeys: Record<tools.LanguageType, i18n.TranslationsKeyType[]> = {};

    const problems: PrerequisiteTranslationsProblemType[] = [];

    for (const language of supportedLanguages) {
      const translations = await new i18n.I18n().getTranslations(language as tools.LanguageType);
      const translationKeys = Object.keys(translations);

      languageToTranslationKeys[language as tools.LanguageType] = translationKeys;
    }

    for (const currentLanguage in languageToTranslationKeys) {
      const translationKeys = languageToTranslationKeys[currentLanguage as tools.LanguageType] ?? [];

      for (const translationKey of translationKeys) {
        for (const supportedLanguage of supportedLanguages) {
          if (supportedLanguage === currentLanguage) continue;

          const translationKeyExists = languageToTranslationKeys[
            supportedLanguage as tools.LanguageType
          ]?.some((key) => translationKey === key);

          if (!translationKeyExists) {
            problems.push({
              translationKey,
              existsInLanguage: currentLanguage as tools.LanguageType,
              missingInLanguage: supportedLanguage as tools.LanguageType,
            });
          }
        }
      }
    }

    if (problems.length === 0) return prereqs.Verification.success();

    const summary = problems
      .map(
        (problem) =>
          `Key: ${problem.translationKey}, exists in ${problem.existsInLanguage}, missing in ${problem.missingInLanguage}`,
      )
      .join("\n");

    return prereqs.Verification.failure({ message: summary });
  }
}
