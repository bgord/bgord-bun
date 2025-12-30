import type * as tools from "@bgord/tools";

type ImageBackground = string | { r: number; g: number; b: number; alpha?: number };
type ImageProcessorOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
  maxSide: tools.IntegerPositiveType;
  to: tools.ExtensionType;
  quality?: tools.IntegerPositiveType;
  background?: ImageBackground;
};
type ImageProcessorInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  maxSide: tools.IntegerPositiveType;
  to: tools.ExtensionType;
  quality?: tools.IntegerPositiveType;
  background?: ImageBackground;
};
export type ImageProcessorStrategy = ImageProcessorInPlaceStrategy | ImageProcessorOutputPathStrategy;

export interface ImageProcessorPort {
  process(recipe: ImageProcessorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
