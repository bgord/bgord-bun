import type * as tools from "@bgord/tools";

export interface SecureKeyGeneratorPort {
  generate(bytes: tools.IntegerPositiveType): Uint8Array;
}
