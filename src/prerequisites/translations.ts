import { constants } from "node:fs";
import fsp from "node:fs/promises";
import type * as tools from "@bgord/tools";
import * as i18n from "../i18n.service";
import * as prereqs from "../prerequisites.service";

type PrerequisiteTranslationsConfigType = {
  translationsPath?: typeof i18n.I18n.DEFAULT_TRANSLATIONS_PATH;
  supportedLanguages: i18n.I18nConfigType["supportedLanguages"];
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

type PrerequisiteTranslationsProblemType = {
  translationKey: i18n.TranslationsKeyType;
  existsInLanguage: tools.LanguageType;
  missingInLanguage: tools.LanguageType;
};

export class PrerequisiteTranslations extends prereqs.AbstractPrerequisite<PrerequisiteTranslationsConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.translations;

  constructor(readonly config: PrerequisiteTranslationsConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    const translationsPath = this.config.translationsPath ?? i18n.I18n.DEFAULT_TRANSLATIONS_PATH;

    try {
      await fsp.access(translationsPath, constants.R_OK);

      for (const language in this.config.supportedLanguages) {
        await fsp.access(
          new i18n.I18n().getTranslationPathForLanguage(language as tools.LanguageType),
          constants.R_OK,
        );
      }
    } catch (_error) {
      return this.reject();
    }

    const supportedLanguages = Object.keys(this.config.supportedLanguages);

    if (supportedLanguages.length === 1) return this.pass();

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

    if (problems.length === 0) return this.pass();

    console.log(problems);

    return this.reject();
  }
}
