import { constants } from "node:fs";
import fsp from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import type * as types from "../i18n.service";
import { I18n } from "../i18n.service";
import type { JsonFileReaderPort } from "../json-file-reader.port";
import type { LoggerPort } from "../logger.port";
import * as prereqs from "../prerequisites.service";

type PrerequisiteTranslationsProblemType = {
  key: types.TranslationsKeyType;
  existsIn: tools.LanguageType;
  missingIn: tools.LanguageType;
};

export class PrerequisiteTranslations implements prereqs.Prerequisite {
  readonly kind = "translations";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly translationsPath?: typeof I18n.DEFAULT_TRANSLATIONS_PATH;
  private readonly supportedLanguages: types.I18nConfigType["supportedLanguages"];

  private readonly Logger: LoggerPort;
  private readonly JsonFileReader: JsonFileReaderPort;

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      translationsPath?: typeof I18n.DEFAULT_TRANSLATIONS_PATH;
      supportedLanguages: types.I18nConfigType["supportedLanguages"];
      Logger: LoggerPort;
      JsonFileReader: JsonFileReaderPort;
    },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.translationsPath = config.translationsPath;
    this.supportedLanguages = config.supportedLanguages;

    this.Logger = config.Logger;
    this.JsonFileReader = config.JsonFileReader;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined();

    const translationsPath = this.translationsPath ?? I18n.DEFAULT_TRANSLATIONS_PATH;

    const supportedLanguages = Object.keys(this.supportedLanguages);
    const i18n = new I18n({ Logger: this.Logger, JsonFileReader: this.JsonFileReader });

    try {
      await fsp.access(translationsPath, constants.R_OK);

      for (const language of supportedLanguages) {
        await fsp.access(i18n.getTranslationPathForLanguage(language).get(), constants.R_OK);
      }
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }

    if (supportedLanguages.length === 1) return prereqs.Verification.success(stopwatch.stop());

    const languageToTranslationKeys: Record<tools.LanguageType, types.TranslationsKeyType[]> = {};

    const problems: PrerequisiteTranslationsProblemType[] = [];

    for (const language of supportedLanguages) {
      const translations = await i18n.getTranslations(language);
      const translationKeys = Object.keys(translations);

      languageToTranslationKeys[language] = translationKeys;
    }

    for (const language in languageToTranslationKeys) {
      const translationKeys = languageToTranslationKeys[language] ?? [];

      for (const translationKey of translationKeys) {
        for (const supportedLanguage of supportedLanguages) {
          if (supportedLanguage === language) continue;

          const translationKeyExists = languageToTranslationKeys[supportedLanguage]?.some(
            (key) => translationKey === key,
          );

          if (!translationKeyExists) {
            problems.push({ key: translationKey, existsIn: language, missingIn: supportedLanguage });
          }
        }
      }
    }

    if (problems.length === 0) return prereqs.Verification.success(stopwatch.stop());

    const summary = problems
      .map((problem) => `Key: ${problem.key}, exists in ${problem.existsIn}, missing in ${problem.missingIn}`)
      .join("\n");

    return prereqs.Verification.failure({ message: summary });
  }
}
