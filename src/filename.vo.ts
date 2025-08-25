import path from "node:path";
import { BasenameSchema, type BasenameType } from "./basename.vo";
import { ExtensionSchema, type ExtensionType } from "./extension.vo";

export class Filename {
  private constructor(private readonly value: string) {}

  static fromParts(basename: string, extension: string) {
    const value = path.resolve(BasenameSchema.parse(basename), ExtensionSchema.parse(extension));

    return new Filename(value);
  }

  static fromPartsSafe(basename: BasenameType, extension: ExtensionType) {
    const value = path.resolve(basename, extension);

    return new Filename(value);
  }

  get() {
    return this.value;
  }
}
