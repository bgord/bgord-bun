import type * as tools from "@bgord/tools";

type ImageBlurOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
  sigma?: number;
};

type ImageBlurInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  sigma?: number;
};

export type ImageBlurStrategy = ImageBlurOutputPathStrategy | ImageBlurInPlaceStrategy;

export interface ImageBlurPort {
  blur(recipe: ImageBlurStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
