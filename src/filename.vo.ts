import { BasenameSchema, type BasenameType } from "./basename.vo";
import { ExtensionSchema, type ExtensionType } from "./extension.vo";
import { FilenameFromStringSchema } from "./filename-from-string.vo";

export class Filename {
  private constructor(
    private basename: BasenameType,
    private extension: ExtensionType,
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
}
