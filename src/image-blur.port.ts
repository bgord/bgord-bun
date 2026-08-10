import type * as tools from "@bgord/tools";

export type ImageBlurStrategy = {
  input: tools.FilePathRelative | tools.FilePathAbsolute;
  output: tools.FilePathRelative | tools.FilePathAbsolute;
};

export interface ImageBlurPort {
  blur(recipe: ImageBlurStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute>;
}
