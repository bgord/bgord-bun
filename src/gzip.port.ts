import type * as tools from "@bgord/tools";

export type GzipRecipe = {
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
};

export interface GzipPort {
  pack(recipe: GzipRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
