import type * as tools from "@bgord/tools";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import { EncryptionKey } from "./encryption-key.vo";

export const CryptoKeyProviderFileAdapterError = {
  MissingFile: "crypto.key.provider.file.adapter.missing.file",
};

export class CryptoKeyProviderFileAdapter implements CryptoKeyProviderPort {
  constructor(private readonly path: tools.FilePathAbsolute) {}

  async get() {
    const file = Bun.file(this.path.get());
    const exists = await file.exists();

    if (!exists) throw new Error(CryptoKeyProviderFileAdapterError.MissingFile);

    const encryptionKey = EncryptionKey.fromString(await file.text());

    return crypto.subtle.importKey(
      "raw",
      encryptionKey.toBuffer() as BufferSource,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );
  }
}
