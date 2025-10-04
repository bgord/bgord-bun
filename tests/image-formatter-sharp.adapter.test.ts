import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type { ImageFormatterStrategy } from "../src/image-formatter.port";
import { ImageFormatterSharpAdapter } from "../src/image-formatter-sharp.adapter";

const pipeline = {
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

describe("ImageFormatterSharpAdapter.format", () => {
  test("in_place: changes extension, writes temp next to final, atomic rename, unlinks original", async () => {
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    const adapter = new ImageFormatterSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/in/img.png");
    const to = tools.Extension.parse("webp");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    const finalVo = await adapter.format(recipe);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("webp");

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/var/in/img-formatted.webp");
    expect(renameSpy).toHaveBeenCalledWith("/var/in/img-formatted.webp", "/var/in/img.webp");

    expect(unlinkSpy).toHaveBeenCalledWith("/var/in/img.png");

    expect(finalVo.get()).toBe("/var/in/img.webp");

    expect(sharpSpy).toHaveBeenCalledWith("/var/in/img.png");
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("in_place: same extension keeps path and does NOT unlink original", async () => {
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    const adapter = new ImageFormatterSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/in/picture.png");
    const to = tools.Extension.parse("png"); // same as input
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    const finalVo = await adapter.format(recipe);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("png");

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/var/in/picture-formatted.png");
    expect(renameSpy).toHaveBeenCalledWith("/var/in/picture-formatted.png", "/var/in/picture.png");

    expect(unlinkSpy).not.toHaveBeenCalled();
    expect(finalVo.get()).toBe("/var/in/picture.png");
  });

  test("output_path: uses encoder from output extension, writes temp next to output, no unlink of input", async () => {
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    const adapter = new ImageFormatterSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/in/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    const finalVo = await adapter.format(recipe);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("webp");

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/var/out/dest-formatted.webp");
    expect(renameSpy).toHaveBeenCalledWith("/var/out/dest-formatted.webp", "/var/out/dest.webp");

    expect(unlinkSpy).not.toHaveBeenCalled();

    expect(finalVo.get()).toBe("/var/out/dest.webp");
  });

  test("jpg extension on output maps to 'jpeg' encoder", async () => {
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageFormatterSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/img/in.webp");
    const output = tools.FilePathAbsolute.fromString("/img/out/photo.jpg");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    await adapter.format(recipe);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("jpeg"); // mapped

    const expectedTemp = "/img/out/photo-formatted.jpg";
    expect(renameSpy).toHaveBeenCalledWith(expectedTemp, "/img/out/photo.jpg");
  });

  test("relative in_place: builds final and temp in relative directory and unlinks original if changed", async () => {
    spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    const adapter = new ImageFormatterSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const to = tools.Extension.parse("jpeg");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    await adapter.format(recipe);

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("images/pic-formatted.jpeg");
    expect(renameSpy).toHaveBeenCalledWith("images/pic-formatted.jpeg", "images/pic.jpeg");
    expect(unlinkSpy).toHaveBeenCalledWith("images/pic.png");
  });
});
