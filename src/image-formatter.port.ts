import type * as tools from "@bgord/tools";

export type ImageFormatterOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
};

export type ImageFormatterInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  to: tools.ExtensionType;
};
export type ImageFormatterStrategy = ImageFormatterInPlaceStrategy | ImageFormatterOutputPathStrategy;

export interface ImageFormatterPort {
  format(
    recipe: ImageFormatterInPlaceStrategy | ImageFormatterOutputPathStrategy,
  ): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
