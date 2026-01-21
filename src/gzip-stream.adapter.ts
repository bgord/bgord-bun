import { createReadStream, createWriteStream } from "node:fs";
import type * as tools from "@bgord/tools";
import { pipeline } from "node:stream/promises";
import { constants, createGzip } from "node:zlib";
import type { GzipPort, GzipRecipe } from "./gzip.port";

export class GzipStreamAdapter implements GzipPort {
  async pack(recipe: GzipRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const inputPath = recipe.input.get();
    const outputPath = recipe.output.get();

    await pipeline(
      createReadStream(inputPath),
      createGzip({ level: constants.Z_BEST_SPEED }),
      createWriteStream(outputPath),
    );

    return recipe.output;
  }
}
