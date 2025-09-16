import type * as tools from "@bgord/tools";

type ImageFormatterOutputPathStrategy = {
  strategy: "output_path";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
};
type ImageFormatterInPlaceStrategy = {
  strategy: "in_place";
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  to: tools.ExtensionType;
};
export type ImageFormatterStrategy = ImageFormatterInPlaceStrategy | ImageFormatterOutputPathStrategy;

export interface ImageFormatterPort {
  format(recipe: ImageFormatterStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
