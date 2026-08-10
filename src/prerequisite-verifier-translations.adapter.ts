import type * as tools from "@bgord/tools";
import type { Languages } from "./languages.vo";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";
import type { TranslationsKeyType, TranslationsProviderPort } from "./translations-provider.port";

type PrerequisiteTranslationsProblemType = {
  key: TranslationsKeyType;
  existsIn: tools.LanguageType;
  missingIn: tools.LanguageType;
};

type Dependencies = { TranslationsProvider: TranslationsProviderPort };

export class PrerequisiteVerifierTranslationsAdapter<T extends tools.LanguageType>
  implements PrerequisiteVerifierPort
{
  constructor(
    private readonly config: Languages<T>,
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const languages = this.config.values;

    const translations = new Map<T, Set<TranslationsKeyType>>();

    for (const language of languages) {
      try {
        const dictionary = await this.deps.TranslationsProvider.getTranslationsFor(language);
        translations.set(language, new Set(Object.keys(dictionary)));
      } catch {
        return PrerequisiteVerification.failure(`${language} translations not available`);
      }
    }

    const problems: Array<PrerequisiteTranslationsProblemType> = [];

    for (const [language, keys] of translations) {
      for (const key of keys) {
        for (const [supportedLanguage, supported] of translations) {
          if (!supported.has(key)) problems.push({ key, existsIn: language, missingIn: supportedLanguage });
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
