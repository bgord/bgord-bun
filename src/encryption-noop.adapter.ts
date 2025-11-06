import type { EncryptionPort, EncryptionRecipe } from "./encryption.port";

export class EncryptionNoopAdapter implements EncryptionPort {
  async encrypt(recipe: EncryptionRecipe) {
    return recipe.output;
  }

  async decrypt(recipe: EncryptionRecipe) {
    return recipe.output;
  }
}
