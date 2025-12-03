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
    const sharp = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const rotate = spyOn(pipeline, "rotate");
    const flatten = spyOn(pipeline, "flatten");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#F8FAFC" };

    const output = await adapter.flatten(recipe);
    expect(output).toEqual(input);

    expect(flatten).toHaveBeenCalledTimes(1);
    expect(flatten).toHaveBeenCalledWith({ background: "#F8FAFC" });
    expect(rotate).toHaveBeenCalledTimes(1);

    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("jpeg");

    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-flattened.jpg");
    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);

    expect(sharp).toHaveBeenCalledWith(input.get());
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    const flatten = spyOn(pipeline, "flatten");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const sharp = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const background = { r: 248, g: 250, b: 252, alpha: 1 };
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background };

    const result = await adapter.flatten(recipe);

    expect(flatten).toHaveBeenCalledWith({ background: background });

    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("webp");

    const temporary = tools.FilePathAbsolute.fromString("/out/dest-flattened.webp");
    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);

    expect(result).toEqual(output);

    expect(sharp).toHaveBeenCalledWith(input.get());
  });

  test("in_place - relative", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFile = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#000" };

    await adapter.flatten(recipe);

    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("png");

    const temporary = tools.FilePathRelative.fromString("images/pic-flattened.png");
    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());

    expect(rename).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - jpeg to jpg", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat");
    const rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background: "#fff" };

    await adapter.flatten(recipe);

    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("jpeg");

    const temporary = tools.FilePathAbsolute.fromString("/x/out/photo-flattened.jpg");
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });
});
