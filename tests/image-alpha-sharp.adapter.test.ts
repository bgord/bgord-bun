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

describe("ImageAlphaSharpAdapter", () => {
  test("in_place", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const flattenSpy = spyOn(pipeline, "flatten").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined as any);

    const adapter = new ImageAlphaSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#F8FAFC" };

    const output = await adapter.flatten(recipe);

    expect(flattenSpy).toHaveBeenCalledTimes(1);
    expect(flattenSpy).toHaveBeenCalledWith({ background: "#F8FAFC" });
    expect(rotateSpy).toHaveBeenCalledTimes(1);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("jpeg");

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/var/img/photo-flattened.jpg");
    expect(renameSpy).toHaveBeenCalledWith("/var/img/photo-flattened.jpg", "/var/img/photo.jpg");

    expect(output).toEqual(input);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const flattenSpy = spyOn(pipeline, "flatten").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageAlphaSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const background = { r: 248, g: 250, b: 252, alpha: 1 };
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background };

    const result = await adapter.flatten(recipe);

    expect(flattenSpy).toHaveBeenCalledWith({ background: background });

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("webp");

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/out/dest-flattened.webp");
    expect(renameSpy).toHaveBeenCalledWith("/out/dest-flattened.webp", "/out/dest.webp");

    expect(result).toEqual(output);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
  });

  test("in_place - relative", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "flatten").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageAlphaSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#000" };

    await adapter.flatten(recipe);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("png");

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("images/pic-flattened.png");

    expect(renameSpy).toHaveBeenCalledWith("images/pic-flattened.png", "images/pic.png");
  });

  test("output_path - jpeg to jpg", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageAlphaSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background: "#fff" };

    await adapter.flatten(recipe);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("jpeg");

    expect(renameSpy).toHaveBeenCalledWith("/x/out/photo-flattened.jpg", "/x/out/photo.jpg");
  });
});
