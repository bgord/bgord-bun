import type * as tools from "@bgord/tools";
import type { SecureKeyGeneratorPort } from "./secure-key-generator.port";

export class SecureKeyGeneratorCryptoAdapter implements SecureKeyGeneratorPort {
  generate(bytes: tools.IntegerPositiveType): Uint8Array {
    const buffer = new Uint8Array(bytes);
    crypto.getRandomValues(buffer);
    return buffer;
  }
}
