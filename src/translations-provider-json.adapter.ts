import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import type { TranslationsProviderPort, TranslationsType } from "./translations-provider.port";

type Config = { languages: ReadonlyArray<tools.LanguageType>; path?: tools.DirectoryPathRelativeType };
type Dependencies = { FileReaderJson: FileReaderJsonPort };

export class TranslationsProviderJsonAdapter implements TranslationsProviderPort {
  static DEFAULT_PATH = v.parse(tools.DirectoryPathRelativeSchema, "infra/translations");

  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async getTranslationsFor(language: tools.LanguageType): Promise<TranslationsType | null> {
    const path = tools.FilePathRelative.fromParts(
      this.config.path ?? TranslationsProviderJsonAdapter.DEFAULT_PATH,
      tools.Filename.fromParts(language, "json"),
    );

    try {
      const translations = await this.deps.FileReaderJson.read(path);

      return translations ?? null;
    } catch (error) {
      return null;
    }
  }

  getLanguages(): ReadonlyArray<tools.LanguageType> {
    return this.config.languages;
  }
}
