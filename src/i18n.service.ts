import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import type { LoggerPort } from "./logger.port";

export type TranslationsKeyType = string;
export type TranslationsValueType = string;
export type TranslationsType = Record<TranslationsKeyType, TranslationsValueType>;
export type TranslationPlaceholderType = string;
export type TranslationPlaceholderValueType = string | number;
export type TranslationVariableType = Record<TranslationPlaceholderType, TranslationPlaceholderValueType>;

type Dependencies = { FileReaderJson: FileReaderJsonPort; Logger: LoggerPort };

export class I18n {
  static DEFAULT_TRANSLATIONS_PATH = v.parse(tools.DirectoryPathRelativeSchema, "infra/translations");

  constructor(
    private readonly deps: Dependencies,
    private translationsPath: tools.DirectoryPathRelativeType = I18n.DEFAULT_TRANSLATIONS_PATH,
  ) {}

  async getTranslations(language: tools.LanguageType): Promise<TranslationsType> {
    const path = tools.FilePathRelative.fromParts(
      this.translationsPath,
      tools.Filename.fromParts(language, "json"),
    );

    return this.deps.FileReaderJson.read(path);
  }
}
