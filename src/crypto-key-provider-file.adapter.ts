import type * as tools from "@bgord/tools";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import { EncryptionKey } from "./encryption-key.vo";
import type { FileInspectionPort } from "./file-inspection.port";

export const CryptoKeyProviderFileAdapterError = {
  MissingFile: "crypto.key.provider.file.adapter.missing.file",
};

type Dependencies = { FileInspection: FileInspectionPort };

export class CryptoKeyProviderFileAdapter implements CryptoKeyProviderPort {
  constructor(
    private readonly path: tools.FilePathAbsolute | tools.FilePathRelative,
    private readonly deps: Dependencies,
  ) {}

  async get(): Promise<CryptoKey> {
    const exists = await this.deps.FileInspection.exists(this.path);

    if (!exists) throw new Error(CryptoKeyProviderFileAdapterError.MissingFile);

    const content = await Bun.file(this.path.get()).text();
    const encryptionKey = EncryptionKey.fromString(content.trim());

    return crypto.subtle.importKey(
      "raw",
      encryptionKey.toBuffer() as BufferSource,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );
  }
}
