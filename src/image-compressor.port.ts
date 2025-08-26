import type * as tools from "@bgord/tools";

export type ImageCompressorOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
  quality?: number;
};

export type ImageCompressorInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  quality?: number;
};

export interface ImageCompressorPort {
  clear(
    recipe: ImageCompressorInPlaceStrategy | ImageCompressorOutputPathStrategy,
  ): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
