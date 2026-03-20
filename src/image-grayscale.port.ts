import type * as tools from "@bgord/tools";

export type ImageGrayscaleOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
};
export type ImageGrayscaleInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
};
export type ImageGrayscaleStrategy = ImageGrayscaleInPlaceStrategy | ImageGrayscaleOutputPathStrategy;

export interface ImageGrayscalePort {
  grayscale(recipe: ImageGrayscaleStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
