import type { SecureKeyGeneratorPort } from "./secure-key-generator.port";

export class SecureKeyGeneratorNoopAdapter implements SecureKeyGeneratorPort {
  constructor(private readonly value: Uint8Array = new TextEncoder().encode("noop")) {}

  generate(): Uint8Array {
    return this.value;
  }
}
