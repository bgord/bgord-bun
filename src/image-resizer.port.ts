import type * as tools from "@bgord/tools";

export type ImageResizerOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
  maxSide: number;
};

export type ImageResizerInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  maxSide: number;
};

export type ImageResizerStrategy = ImageResizerOutputPathStrategy | ImageResizerInPlaceStrategy;

export interface ImageResizerPort {
  resize(recipe: ImageResizerStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
