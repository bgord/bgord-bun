import type * as tools from "@bgord/tools";
import type { SecureKeyGeneratorPort } from "./secure-key-generator.port";

export class SecureKeyGeneratorCryptoAdapter implements SecureKeyGeneratorPort {
  // crypto.getRandomValues is spec-limited to a 65536-byte view
  static readonly MAX_BYTES = 65_536;

  generate(bytes: tools.IntegerPositiveType): Uint8Array {
    const buffer = new Uint8Array(bytes);

    for (let offset = 0; offset < bytes; offset += SecureKeyGeneratorCryptoAdapter.MAX_BYTES) {
      crypto.getRandomValues(buffer.subarray(offset, offset + SecureKeyGeneratorCryptoAdapter.MAX_BYTES));
    }

    return buffer;
  }
}
