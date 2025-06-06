import { constants } from "node:fs";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";

import * as i18n from "../i18n";
import * as prereqs from "../prerequisites";

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
        await fsp.access(new i18n.I18n().getTranslationPathForLanguage(language), constants.R_OK);
      }
    } catch (error) {
      return this.reject();
    }

    const supportedLanguages = Object.keys(this.config.supportedLanguages);

    if (supportedLanguages.length === 1) return this.pass();

    const languageToTranslationKeys: Record<tools.LanguageType, i18n.TranslationsKeyType[]> = {};

    const problems: PrerequisiteTranslationsProblemType[] = [];

    for (const language of supportedLanguages) {
      const translations = await new i18n.I18n().getTranslations(language);
      const translationKeys = Object.keys(translations);

      languageToTranslationKeys[language] = translationKeys;
    }

    for (const currentLanguage in languageToTranslationKeys) {
      const translationKeys = languageToTranslationKeys[currentLanguage] ?? [];

      for (const translationKey of translationKeys) {
        for (const supportedLanguage of supportedLanguages) {
          if (supportedLanguage === currentLanguage) continue;

          const translationKeyExists = languageToTranslationKeys[supportedLanguage]?.some(
            (key) => translationKey === key,
          );

          if (!translationKeyExists) {
            problems.push({
              translationKey,
              existsInLanguage: currentLanguage,
              missingInLanguage: supportedLanguage,
            });
          }
        }
      }
    }

    if (problems.length === 0) return this.pass();

    // biome-ignore lint: lint/suspicious/noConsoleLog
    console.log(problems);

    return this.reject();
  }
}
