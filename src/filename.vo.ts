import { BasenameSchema, type BasenameType } from "./basename.vo";
import { ExtensionSchema, type ExtensionType } from "./extension.vo";
import { FilenameFromStringSchema } from "./filename-from-string.vo";
import { FilenameSuffixSchema } from "./filename-suffix.vo";

export class Filename {
  private constructor(
    private readonly basename: BasenameType,
    private readonly extension: ExtensionType,
  ) {}

  static fromParts(basename: string, extension: string) {
    return new Filename(BasenameSchema.parse(basename), ExtensionSchema.parse(extension));
  }

  static fromPartsSafe(basename: BasenameType, extension: ExtensionType) {
    return new Filename(basename, extension);
  }

  static fromString(candidate: string) {
    const { basename, extension } = FilenameFromStringSchema.parse(candidate);

    return new Filename(basename, extension);
  }

  get() {
    return `${this.basename}.${this.extension}`;
  }

  getBasename(): BasenameType {
    return this.basename;
  }

  getExtension(): ExtensionType {
    return this.extension;
  }

  withExtension(extension: ExtensionType): Filename {
    return new Filename(this.basename, extension);
  }

  withBasename(basename: BasenameType): Filename {
    return new Filename(basename, this.extension);
  }

  withSuffix(candidate: string): Filename {
    const suffix = FilenameSuffixSchema.parse(candidate);
    const basename = BasenameSchema.parse(`${this.basename}${suffix}`);

    return new Filename(basename, this.extension);
  }
}
