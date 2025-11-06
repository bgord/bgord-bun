import type * as tools from "@bgord/tools";

export type EncryptionRecipe = {
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
};

export interface EncryptionPort {
  encrypt(recipe: EncryptionRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
  decrypt(recipe: EncryptionRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
