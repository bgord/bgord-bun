import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type { ImageBlurStrategy } from "../src/image-blur.port";
import { ImageBlurSharpAdapter } from "../src/image-blur-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  blur: (_?: number) => pipeline,
  toFormat: (_fmt: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

describe("ImageBlurSharpAdapter.blur", () => {
  test("in_place: default sigma (undefined), maps jpg→jpeg, writes temp next to final, atomic rename", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const blurSpy = spyOn(pipeline, "blur").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageBlurSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg"); // jpg → jpeg encoder
    const recipe: ImageBlurStrategy = { strategy: "in_place", input };

    // Act
    const finalVo = await adapter.blur(recipe);

    // Assert: blur called with undefined (default), rotate called, encoder from final extension
    expect(blurSpy).toHaveBeenCalledTimes(1);
    expect(blurSpy).toHaveBeenCalledWith(undefined);
    expect(rotateSpy).toHaveBeenCalledTimes(1);

    expect(toFormatSpy).toHaveBeenCalledTimes(1);
    const [fmt] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("jpeg");

    // Temp based on FINAL path & rename
    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/var/img/photo-blurred.jpg");
    expect(renameSpy).toHaveBeenCalledWith("/var/img/photo-blurred.jpg", "/var/img/photo.jpg");

    // Returns same VO for in_place
    expect(finalVo).toBe(input);

    // sharp called with input, disposed
    expect(sharpSpy).toHaveBeenCalledWith("/var/img/photo.jpg");
    expect(destroySpy).toHaveBeenCalledTimes(1);

    // Cleanup
  });

  test("output_path: applies provided sigma, picks encoder from output extension, temp next to output, atomic rename", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const blurSpy = spyOn(pipeline, "blur").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageBlurSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 2.5 };

    const finalVo = await adapter.blur(recipe);

    // sigma passed through
    expect(blurSpy).toHaveBeenCalledWith(2.5);

    // Encoder from FINAL output extension
    const [fmt] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("webp");

    // Temp based on FINAL output & rename
    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/out/dest-blurred.webp");
    expect(renameSpy).toHaveBeenCalledWith("/out/dest-blurred.webp", "/out/dest.webp");

    // Returned VO is the provided output
    expect(finalVo).toBe(output);

    expect(sharpSpy).toHaveBeenCalledWith("/in/source.png");
  });

  test("relative in_place: builds temp beside relative final and uses encoder from final extension", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "blur").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageBlurSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input, sigma: 1 };

    await adapter.blur(recipe);

    const [fmt] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("png");

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("images/pic-blurred.png");
    expect(renameSpy).toHaveBeenCalledWith("images/pic-blurred.png", "images/pic.png");
  });

  test("jpg output mapping in output_path: '.jpg' → encoder 'jpeg'", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageBlurSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 0.7 };

    await adapter.blur(recipe);

    const [fmt] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("jpeg");

    const expectedTemp = "/x/out/photo-blurred.jpg";
    expect(renameSpy).toHaveBeenCalledWith(expectedTemp, "/x/out/photo.jpg");
  });
});
