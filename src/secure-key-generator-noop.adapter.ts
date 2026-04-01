import type * as tools from "@bgord/tools";
import type { SecureKeyGeneratorPort } from "./secure-key-generator.port";

export class SecureKeyGeneratorNoopAdapter implements SecureKeyGeneratorPort {
  constructor(private readonly value: Uint8Array = new TextEncoder().encode("0".repeat(32))) {}

  generate(_bytes: tools.IntegerPositiveType): Uint8Array {
    return this.value;
  }
}
