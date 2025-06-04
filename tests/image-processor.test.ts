import { describe, expect, it } from "bun:test";
import sharp from "sharp";
import { ImageProcessor } from "../src/image-processor";

describe("ImageProcessor", () => {
  it("should expose the sharp module", () => {
    expect(ImageProcessor.sharp).toBe(sharp);
  });

  it("should allow basic sharp usage through ImageProcessor", async () => {
    const imageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    const resized = await ImageProcessor.sharp(imageBuffer).resize(50, 50).toBuffer();

    const metadata = await ImageProcessor.sharp(resized).metadata();

    expect(metadata.width).toBe(50);
    expect(metadata.height).toBe(50);
  });
});
