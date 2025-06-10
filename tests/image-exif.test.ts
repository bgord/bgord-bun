import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";

import { ImageEXIF } from "../src/image-exif.service";
import { PathType } from "../src/path";

const inputImagePath: PathType = path.join(import.meta.dir, "fixtures", "sample.jpg");
const outputImagePath: PathType = path.join(import.meta.dir, "fixtures", "output.jpg");

describe("ImageEXIF", () => {
  beforeAll(async () => {
    await fs.mkdir(path.dirname(outputImagePath), { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(outputImagePath, { force: true });
  });

  it("reads image metadata correctly", async () => {
    const result = await ImageEXIF.read(inputImagePath);

    expect(result).toHaveProperty("width");
    expect(result).toHaveProperty("height");
    expect(result).toHaveProperty("name");
    expect(result.name).toBe("sample.jpg");
    expect(result.mimeType).toMatch(/^image\//);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it("removes exif data and writes new file", async () => {
    const output = await ImageEXIF.clear({
      input: inputImagePath,
      output: outputImagePath,
    });

    expect(output).toHaveProperty("width");
    expect(output).toHaveProperty("height");

    expect(await Bun.file(outputImagePath).exists()).toBe(true);
  });
});
