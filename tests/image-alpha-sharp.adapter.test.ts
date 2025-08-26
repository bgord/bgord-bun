import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type { ImageAlphaStrategy } from "../src/image-alpha.port";
import { ImageAlphaSharpAdapter } from "../src/image-alpha-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  flatten: (_: any) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

describe("ImageAlphaSharpAdapter.flatten", () => {
  test("in_place: flattens onto a hex background, maps jpg→jpeg, writes temp next to final, atomic rename", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline as any);
    const flattenSpy = spyOn(pipeline, "flatten").mockReturnValue(pipeline as any);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline as any);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined as any);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline as any);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined as any);

    const adapter = new ImageAlphaSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg"); // jpg → jpeg encoder
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#F8FAFC" };

    const finalVo = await adapter.flatten(recipe);

    expect(flattenSpy).toHaveBeenCalledTimes(1);
    expect(flattenSpy).toHaveBeenCalledWith({ background: "#F8FAFC" });
    expect(rotateSpy).toHaveBeenCalledTimes(1);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("jpeg");

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/var/img/photo-flattened.jpg");
    expect(renameSpy).toHaveBeenCalledWith("/var/img/photo-flattened.jpg", "/var/img/photo.jpg");

    expect(finalVo).toBe(input);

    expect(sharpSpy).toHaveBeenCalledWith("/var/img/photo.jpg");
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path: flattens onto RGBA background, picks encoder from output extension, temp next to output, atomic rename", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline as any);
    const flattenSpy = spyOn(pipeline, "flatten").mockReturnValue(pipeline as any);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline as any);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined as any);
    spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline as any);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined as any);

    const adapter = new ImageAlphaSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const bg = { r: 248, g: 250, b: 252, alpha: 1 };
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background: bg };

    const finalVo = await adapter.flatten(recipe);

    expect(flattenSpy).toHaveBeenCalledWith({ background: bg });

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("webp");

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/out/dest-flattened.webp");
    expect(renameSpy).toHaveBeenCalledWith("/out/dest-flattened.webp", "/out/dest.webp");

    expect(finalVo).toBe(output);

    expect(sharpSpy).toHaveBeenCalledWith("/in/source.png");
  });

  test("relative in_place: builds temp beside relative final and uses encoder from final extension", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline as any);
    spyOn(pipeline, "flatten").mockReturnValue(pipeline as any);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline as any);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined as any);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline as any);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined as any);

    const adapter = new ImageAlphaSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#000" };

    await adapter.flatten(recipe);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("png");

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("images/pic-flattened.png");
    expect(renameSpy).toHaveBeenCalledWith("images/pic-flattened.png", "images/pic.png");
  });

  test("jpg output mapping in output_path: '.jpg' → encoder 'jpeg'", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline as any);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline as any);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined as any);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline as any);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined as any);

    const adapter = new ImageAlphaSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background: "#fff" };

    await adapter.flatten(recipe);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("jpeg"); // mapped

    const expectedTemp = "/x/out/photo-flattened.jpg";
    expect(renameSpy).toHaveBeenCalledWith(expectedTemp, "/x/out/photo.jpg");
  });
});
