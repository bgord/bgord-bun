import type * as tools from "@bgord/tools";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import type * as types from "./i18n.service";
import { I18n } from "./i18n.service";
import type { LoggerPort } from "./logger.port";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type PrerequisiteTranslationsProblemType = {
  key: types.TranslationsKeyType;
  existsIn: tools.LanguageType;
  missingIn: tools.LanguageType;
};

type Dependencies = { Logger: LoggerPort; FileReaderJson: FileReaderJsonPort };

type Config = { supportedLanguages: types.I18nConfigType["supportedLanguages"] };

export class PrerequisiteVerifierTranslationsAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const supportedLanguages = Object.keys(this.config.supportedLanguages);
    const i18n = new I18n(this.deps);

    const dictionary: Partial<Record<tools.LanguageType, types.TranslationsKeyType[]>> = {};

    for (const language of supportedLanguages) {
      try {
        const translations = await i18n.getTranslations(language);
        dictionary[language] = Object.keys(translations);
      } catch (error) {
        return PrerequisiteVerification.failure(`${language} translations not available`);
      }
    }

    const problems: PrerequisiteTranslationsProblemType[] = [];

    for (const language in dictionary) {
      const phrases = dictionary[language] ?? ([] as const);

      for (const phrase of phrases) {
        for (const supportedLanguage of supportedLanguages) {
          const phraseExists = new Set(dictionary[supportedLanguage]).has(phrase);

          if (!phraseExists) problems.push({ key: phrase, existsIn: language, missingIn: supportedLanguage });
        }
      }
    }

    if (problems.length === 0) return PrerequisiteVerification.success;

    const summary = problems
      .map((problem) => `Key: ${problem.key}, exists in ${problem.existsIn}, missing in ${problem.missingIn}`)
      .join("\n");

    return PrerequisiteVerification.failure(summary);
  }

  get kind(): string {
    return "translations";
  }
}
