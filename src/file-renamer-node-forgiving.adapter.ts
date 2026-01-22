import fs from "node:fs/promises";
import type * as tools from "@bgord/tools";
import type { FileRenamerPort } from "./file-renamer.port";

export class FileRenamerNodeForgivingAdapter implements FileRenamerPort {
  async rename(
    input: tools.FilePathRelative | tools.FilePathAbsolute | string,
    output: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<void> {
    const from = typeof input === "string" ? input : input.get();
    const to = typeof output === "string" ? output : output.get();

    try {
      await fs.rename(from, to);
    } catch {}
  }
}
