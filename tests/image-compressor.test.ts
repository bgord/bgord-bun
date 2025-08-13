import { describe, expect, it } from "bun:test";
import { ImageCompressionQuality, ImageCompressor } from "../src/image-compressor.service";

const SAMPLE_IMAGE = "tests/fixtures/sample.jpg";
const COMPRESSED_IMAGE = "tests/tmp/compressed.jpg";
const CUSTOM_QUALITY_IMAGE = "tests/tmp/compressed-custom.jpg";

describe("ImageCompressionQuality", () => {
  it("accepts valid values within the range", () => {
    expect(ImageCompressionQuality.safeParse(1).success).toBe(true);
    expect(ImageCompressionQuality.safeParse(50).success).toBe(true);
    expect(ImageCompressionQuality.safeParse(100).success).toBe(true);
  });

  it("rejects values below 1", () => {
    expect(ImageCompressionQuality.safeParse(0).success).toBe(false);
    expect(ImageCompressionQuality.safeParse(-10).success).toBe(false);
  });

  it("rejects values above 100", () => {
    expect(ImageCompressionQuality.safeParse(101).success).toBe(false);
    expect(ImageCompressionQuality.safeParse(999).success).toBe(false);
  });

  it("rejects non-integer values", () => {
    expect(ImageCompressionQuality.safeParse(50.5).success).toBe(false);
    expect(ImageCompressionQuality.safeParse(99.9).success).toBe(false);
  });

  it("rejects non-number values", () => {
    expect(ImageCompressionQuality.safeParse("85").success).toBe(false);
    expect(ImageCompressionQuality.safeParse(null).success).toBe(false);
  });

  it("uses the default value of 85 when undefined", () => {
    const result = ImageCompressionQuality.parse(undefined);
    expect(result).toEqual(ImageCompressionQuality.parse(85));
  });
});

describe("ImageCompressor", () => {
  it("compresses image with default quality (85)", async () => {
    const result = await ImageCompressor.compress({
      input: SAMPLE_IMAGE,
      output: COMPRESSED_IMAGE,
    });

    expect(result.size).toBeGreaterThan(0);
    expect(await Bun.file(COMPRESSED_IMAGE).exists()).toBe(true);

    await Bun.file(COMPRESSED_IMAGE).unlink();
  });

  it("compresses image with custom quality", async () => {
    const result = await ImageCompressor.compress({
      input: SAMPLE_IMAGE,
      output: CUSTOM_QUALITY_IMAGE,
      quality: ImageCompressionQuality.parse(30),
    });

    expect(result.size).toBeGreaterThan(0);
    expect(await Bun.file(CUSTOM_QUALITY_IMAGE).exists()).toBe(true);

    await Bun.file(CUSTOM_QUALITY_IMAGE).unlink();
  });
});
