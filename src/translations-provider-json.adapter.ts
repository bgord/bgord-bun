import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import type { TranslationsProviderPort, TranslationsType } from "./translations-provider.port";

type Config = { path?: tools.DirectoryPathRelativeType };
type Dependencies = { FileReaderJson: FileReaderJsonPort };

export class TranslationsProviderJsonAdapter implements TranslationsProviderPort {
  static readonly DEFAULT_PATH = v.parse(tools.DirectoryPathRelativeSchema, "infra/translations");

  constructor(
    private readonly deps: Dependencies,
    private readonly config?: Config,
  ) {}

  async getTranslationsFor(language: tools.LanguageType): Promise<TranslationsType> {
    const path = tools.FilePathRelative.fromParts(
      this.config?.path ?? TranslationsProviderJsonAdapter.DEFAULT_PATH,
      tools.Filename.fromParts(language, "json"),
    );

    try {
      return await this.deps.FileReaderJson.read(path);
    } catch (error) {
      return {};
    }
  }
}
