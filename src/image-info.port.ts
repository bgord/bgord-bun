import type * as tools from "@bgord/tools";

export type ImageInfoType = {
  height: tools.ImageHeightType;
  width: tools.ImageWidthType;
  mime: tools.Mime;
  size: tools.Size;
};

export interface ImageInfoPort {
  inspect(filePath: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ImageInfoType>;
}
