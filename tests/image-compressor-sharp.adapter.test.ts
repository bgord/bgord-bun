import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type {
  ImageCompressorInPlaceStrategy,
  ImageCompressorOutputPathStrategy,
} from "../src/image-compressor.port";
import { ImageCompressorSharpAdapter } from "../src/image-compressor-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  toFormat: (_format: any, _opts?: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

const adapter = new ImageCompressorSharpAdapter(deps);

describe("ImageCompressorSharpAdapter", () => {
  test("in_place", async () => {
    const sharp = spyOn(_sharp, "default").mockImplementation(() => pipeline);
    const rotate = spyOn(pipeline, "rotate");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageCompressorInPlaceStrategy = { strategy: "in_place", input };

    const result = await adapter.compress(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-compressed.jpg");

    expect(result).toEqual(input);
    expect(toFormat).toHaveBeenCalledWith("jpeg", { quality: 85 });
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(sharp).toHaveBeenCalledWith(input.get());
    expect(rotate).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    spyOn(_sharp, "default").mockImplementation(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
    const recipe: ImageCompressorOutputPathStrategy = {
      strategy: "output_path",
      input,
      output,
      quality: tools.IntegerPositive.parse(73),
    };

    const result = await adapter.compress(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/out/dest-compressed.webp");

    expect(result).toEqual(output);
    expect(toFormat).toHaveBeenCalledWith("webp", { quality: 73 });
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("in_place - relative", async () => {
    spyOn(_sharp, "default").mockImplementation(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageCompressorInPlaceStrategy = { strategy: "in_place", input };

    await adapter.compress(recipe);
    const temporary = tools.FilePathRelative.fromString("images/pic-compressed.png");

    expect(toFormat).toHaveBeenCalledWith("png", { quality: 85 });
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - jpeg to jpg", async () => {
    spyOn(_sharp, "default").mockImplementation(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/x/in.jpeg");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageCompressorOutputPathStrategy = { strategy: "output_path", input, output };

    await adapter.compress(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/x/out/photo-compressed.jpg");

    expect(rename).toHaveBeenCalledWith(temporary, output);
    expect(toFormat).toHaveBeenCalledWith("jpeg", { quality: 85 });
  });
});
