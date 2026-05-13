export type ImageSupportedType = Exclude<Bun.Image.Format, "bmp" | "tiff" | "gif">;
