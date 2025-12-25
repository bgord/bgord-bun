import { constants } from "node:fs";
import fsp from "node:fs/promises";
import type * as tools from "@bgord/tools";
import type * as types from "../i18n.service";
import { I18n } from "../i18n.service";
import type { JsonFileReaderPort } from "../json-file-reader.port";
import { JsonFileReaderBunForgivingAdapter } from "../json-file-reader-bun-forgiving.adapter";
import type { LoggerPort } from "../logger.port";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

type PrerequisiteTranslationsProblemType = {
  key: types.TranslationsKeyType;
  existsIn: tools.LanguageType;
  missingIn: tools.LanguageType;
};

type Dependencies = { Logger: LoggerPort; JsonFileReader?: JsonFileReaderPort };

export class PrerequisiteTranslations implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly translationsPath?: typeof I18n.DEFAULT_TRANSLATIONS_PATH;
  private readonly supportedLanguages: types.I18nConfigType["supportedLanguages"];

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      translationsPath?: typeof I18n.DEFAULT_TRANSLATIONS_PATH;
      supportedLanguages: types.I18nConfigType["supportedLanguages"];
    },
    private readonly deps: Dependencies,
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.translationsPath = config.translationsPath;
    this.supportedLanguages = config.supportedLanguages;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const JsonFileReader = this.deps.JsonFileReader ?? new JsonFileReaderBunForgivingAdapter();

    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined;

    const translationsPath = this.translationsPath ?? I18n.DEFAULT_TRANSLATIONS_PATH;

    const supportedLanguages = Object.keys(this.supportedLanguages);
    const i18n = new I18n({ Logger: this.deps.Logger, JsonFileReader: JsonFileReader });

    try {
      await fsp.access(translationsPath, constants.R_OK);

      for (const language of supportedLanguages) {
        await fsp.access(i18n.getTranslationPathForLanguage(language).get(), constants.R_OK);
      }
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }

    if (supportedLanguages.length === 1) return prereqs.PrerequisiteVerification.success;

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

    if (problems.length === 0) return prereqs.PrerequisiteVerification.success;

    const summary = problems
      .map((problem) => `Key: ${problem.key}, exists in ${problem.existsIn}, missing in ${problem.missingIn}`)
      .join("\n");

    return prereqs.PrerequisiteVerification.failure({ message: summary });
  }

  get kind() {
    return "translations";
  }
}
