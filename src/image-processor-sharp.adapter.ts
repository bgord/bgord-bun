import fs from "node:fs/promises";
import type * as tools from "@bgord/tools";
import sharp from "sharp";
import type { ImageProcessorPort, ImageProcessorStrategy } from "./image-processor.port";

export class ImageProcessorSharpAdapter implements ImageProcessorPort {
  private static readonly DEFAULT_QUALITY = 85;

  async process(recipe: ImageProcessorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final =
      recipe.strategy === "output_path"
        ? recipe.output
        : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));

    const temporary = final.withFilename(final.getFilename().withSuffix("-processed"));

    const finalExtension = final.getFilename().getExtension();
    const encoder = (finalExtension === "jpg" ? "jpeg" : finalExtension) as keyof sharp.FormatEnum;

    const quality = recipe.quality ?? ImageProcessorSharpAdapter.DEFAULT_QUALITY;

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    let processor = pipeline.rotate();

    if (recipe.background) {
      processor = processor.flatten({ background: recipe.background as any });
    }

    processor = processor.resize({
      width: recipe.maxSide,
      height: recipe.maxSide,
      fit: "inside",
      withoutEnlargement: true,
    });

    processor = processor.toFormat(encoder, { quality });

    await processor.toFile(temporary.get());
    await fs.rename(temporary.get(), final.get());

    if (recipe.strategy === "in_place" && final.get() !== recipe.input.get()) {
      await fs.unlink(recipe.input.get());
    }

    return final;
  }
}
