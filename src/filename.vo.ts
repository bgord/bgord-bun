import { BasenameSchema, type BasenameType } from "./basename.vo";
import { ExtensionSchema, type ExtensionType } from "./extension.vo";
import { FilenameFromStringSchema } from "./filename-from-string.vo";

export class Filename {
  private constructor(private readonly value: string) {}

  static fromParts(basename: string, extension: string) {
    const value = `${BasenameSchema.parse(basename)}.${ExtensionSchema.parse(extension)}`;

    return new Filename(value);
  }

  static fromPartsSafe(basename: BasenameType, extension: ExtensionType) {
    const value = `${basename}.${extension}`;

    return new Filename(value);
  }

  static fromString(candidate: string) {
    const { basename, extension } = FilenameFromStringSchema.parse(candidate);
    const value = `${basename}.${extension}`;

    return new Filename(value);
  }

  get() {
    return this.value;
  }
}
