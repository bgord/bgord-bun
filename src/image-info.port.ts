import type * as tools from "@bgord/tools";

type ImageInfoType = { height: tools.HeightType; width: tools.WidthType; mime: tools.Mime; size: tools.Size };

export interface ImageInfoPort {
  inspect(filePath: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ImageInfoType>;
}
