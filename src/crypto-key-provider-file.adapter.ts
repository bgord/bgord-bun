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

    const content = await file.text();

    const encryptionKey = EncryptionKey.parse(content);

    const bytes = new Uint8Array(32);

    for (let i = 0; i < 32; i++) {
      bytes[i] = Number.parseInt(encryptionKey.slice(i * 2, i * 2 + 2), 16);
    }

    return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  }
}
