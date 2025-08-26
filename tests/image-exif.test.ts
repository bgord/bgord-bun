import { describe, expect, it } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";
import { ImageEXIF } from "../src/image-exif.service";

const inputImagePath: string = path.join(import.meta.dir, "fixtures", "sample.jpg");
const outputImagePath: string = path.join(import.meta.dir, "fixtures", "output.jpg");

describe("ImageEXIF", () => {
  it("removes exif data and writes new file", async () => {
    await fs.mkdir(path.dirname(outputImagePath), { recursive: true });

    const output = await ImageEXIF.clear({
      input: inputImagePath,
      output: outputImagePath,
    });

    expect(output).toHaveProperty("width");
    expect(output).toHaveProperty("height");

    expect(await Bun.file(outputImagePath).exists()).toBe(true);

    await fs.rm(outputImagePath, { force: true });
  });
});
