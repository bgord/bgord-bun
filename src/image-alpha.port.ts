import type * as tools from "@bgord/tools";

type ImageAlphaBackground = string | { r: number; g: number; b: number; alpha?: number };
type ImageAlphaOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
  background: ImageAlphaBackground;
};
type ImageAlphaInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  background: ImageAlphaBackground;
};
export type ImageAlphaStrategy = ImageAlphaInPlaceStrategy | ImageAlphaOutputPathStrategy;

export interface ImageAlphaPort {
  flatten(recipe: ImageAlphaStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
