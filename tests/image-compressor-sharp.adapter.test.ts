import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type {
  ImageCompressorInPlaceStrategy,
  ImageCompressorOutputPathStrategy,
} from "../src/image-compressor.port";
import { ImageCompressorSharpAdapter } from "../src/image-compressor-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  toFormat: (_fmt: any, _opts?: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

describe("ImageCompressorSharpAdapter.clear", () => {
  test("in_place: uses default quality (85), maps jpg→jpeg, writes temp next to final, atomic rename", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageCompressorSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg"); // jpg extension should map to jpeg
    const recipe: ImageCompressorInPlaceStrategy = { strategy: "in_place", input };

    const result = await adapter.clear(recipe);

    expect(toFormatSpy).toHaveBeenCalledTimes(1);
    const [fmt, opts] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("jpeg");
    expect(opts).toMatchObject({ quality: 85 });

    expect(toFileSpy).toHaveBeenCalledTimes(1);
    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/var/img/photo-compressed.jpg");
    expect(renameSpy).toHaveBeenCalledWith("/var/img/photo-compressed.jpg", "/var/img/photo.jpg");

    expect(result).toBe(input);

    expect(sharpSpy).toHaveBeenCalledWith("/var/img/photo.jpg");
    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path: uses provided quality, encoder from final extension, temp next to output, atomic rename", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageCompressorSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
    const recipe: ImageCompressorOutputPathStrategy = { strategy: "output_path", input, output, quality: 73 };

    const result = await adapter.clear(recipe);

    expect(toFormatSpy).toHaveBeenCalledTimes(1);
    const [fmt, opts] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("webp");
    expect(opts).toMatchObject({ quality: 73 });

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/var/out/dest-compressed.webp");
    expect(renameSpy).toHaveBeenCalledWith("/var/out/dest-compressed.webp", "/var/out/dest.webp");

    expect(result).toBe(output);
  });

  test("in_place works with relative paths and passes default quality", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageCompressorSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageCompressorInPlaceStrategy = { strategy: "in_place", input };

    await adapter.clear(recipe);

    const [fmt, opts] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("png");
    expect(opts).toMatchObject({ quality: 85 });

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("images/pic-compressed.png");
    expect(renameSpy).toHaveBeenCalledWith("images/pic-compressed.png", "images/pic.png");
  });

  test("jpg extension maps to jpeg encoder in output_path", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageCompressorSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/x/in.jpeg");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg"); // .jpg should → "jpeg"
    const recipe: ImageCompressorOutputPathStrategy = { strategy: "output_path", input, output };

    await adapter.clear(recipe);

    const [fmt] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("jpeg");

    expect(renameSpy).toHaveBeenCalledWith("/x/out/photo-compressed.jpg", "/x/out/photo.jpg");
  });
});
