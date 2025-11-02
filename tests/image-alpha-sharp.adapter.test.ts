import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageAlphaStrategy } from "../src/image-alpha.port";
import { ImageAlphaSharpAdapter } from "../src/image-alpha-sharp.adapter";

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

const pipeline = {
  rotate: () => pipeline,
  flatten: (_: any) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const adapter = new ImageAlphaSharpAdapter(deps);

describe("ImageAlphaSharpAdapter", () => {
  test("in_place", async () => {
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const rotateSpy = spyOn(pipeline, "rotate");
    const flattenSpy = spyOn(pipeline, "flatten");
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const toFileSpy = spyOn(pipeline, "toFile");
    const destroySpy = spyOn(pipeline, "destroy");
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#F8FAFC" };

    const output = await adapter.flatten(recipe);
    expect(output).toEqual(input);

    expect(flattenSpy).toHaveBeenCalledTimes(1);
    expect(flattenSpy).toHaveBeenCalledWith({ background: "#F8FAFC" });
    expect(rotateSpy).toHaveBeenCalledTimes(1);

    expect(toFormatSpy.mock.calls?.[0]?.[0]).toEqual("jpeg");

    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-flattened.jpg");
    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, input);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    const flattenSpy = spyOn(pipeline, "flatten");
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const toFileSpy = spyOn(pipeline, "toFile");
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const background = { r: 248, g: 250, b: 252, alpha: 1 };
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background };

    const result = await adapter.flatten(recipe);

    expect(flattenSpy).toHaveBeenCalledWith({ background: background });

    expect(toFormatSpy.mock.calls?.[0]?.[0]).toEqual("webp");

    const temporary = tools.FilePathAbsolute.fromString("/out/dest-flattened.webp");
    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, output);

    expect(result).toEqual(output);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
  });

  test("in_place - relative", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#000" };

    await adapter.flatten(recipe);

    expect(toFormatSpy.mock.calls?.[0]?.[0]).toEqual("png");

    const temporary = tools.FilePathRelative.fromString("images/pic-flattened.png");
    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());

    expect(renameSpy).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - jpeg to jpg", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background: "#fff" };

    await adapter.flatten(recipe);

    expect(toFormatSpy.mock.calls?.[0]?.[0]).toEqual("jpeg");

    const temporary = tools.FilePathAbsolute.fromString("/x/out/photo-flattened.jpg");
    expect(renameSpy).toHaveBeenCalledWith(temporary, output);
  });
});
