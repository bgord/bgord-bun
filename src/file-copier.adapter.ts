import type * as tools from "@bgord/tools";
import type { FileCopierPort } from "./file-copier.port";

export class FileCopierAdapter implements FileCopierPort {
  async copy(
    source: tools.FilePathRelative | tools.FilePathAbsolute | string,
    destination: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<void> {
    // Stryker disable all
    const file = Bun.file(typeof source === "string" ? source : source.get());
    // Stryker restore all

    await Bun.write(typeof destination === "string" ? destination : destination.get(), file);
  }
}
