import type * as tools from "@bgord/tools";

type ImageProcessorOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
  maxSide: tools.ImageWidthType;
  to: tools.ExtensionType;
  quality?: tools.IntegerPositiveType;
};
type ImageProcessorInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  maxSide: tools.ImageWidthType;
  to: tools.ExtensionType;
  quality?: tools.IntegerPositiveType;
};
export type ImageProcessorStrategy = ImageProcessorInPlaceStrategy | ImageProcessorOutputPathStrategy;

export interface ImageProcessorPort {
  process(recipe: ImageProcessorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
