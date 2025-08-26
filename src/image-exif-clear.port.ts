import type * as tools from "@bgord/tools";

export type ImageExifClearOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
};

export type ImageExifClearInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
};

export interface ImageExifClearPort {
  clear(
    recipe: ImageExifClearInPlaceStrategy | ImageExifClearOutputPathStrategy,
  ): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
