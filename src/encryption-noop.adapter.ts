import type * as tools from "@bgord/tools";
import type { EncryptionPort, EncryptionRecipe } from "./encryption.port";

export class EncryptionNoopAdapter implements EncryptionPort {
  constructor(private readonly result: ArrayBuffer = new TextEncoder().encode("noop").buffer) {}

  async encrypt(recipe: EncryptionRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.output;
  }

  async decrypt(recipe: EncryptionRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.output;
  }

  async view(_input: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ArrayBuffer> {
    return this.result;
  }
}
