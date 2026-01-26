import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type {
  ImageExifClearInPlaceStrategy,
  ImageExifClearOutputPathStrategy,
} from "../src/image-exif-clear.port";
import { ImageExifClearSharpAdapter } from "../src/image-exif-clear-sharp.adapter";
import * as mocks from "./mocks";

const pipeline = {
  rotate: () => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

describe("ImageExifClearSharpAdapter", () => {
  test("in_place", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageExifClearSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const rotate = spyOn(pipeline, "rotate");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpeg");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };
    const adapter = await ImageExifClearSharpAdapter.build(deps);

    const result = await adapter.clear(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-exif-cleared.jpeg");

    expect(result).toEqual(input);
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(rotate).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageExifClearSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const toFile = spyOn(pipeline, "toFile");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };
    const adapter = await ImageExifClearSharpAdapter.build(deps);

    const result = await adapter.clear(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/out/dest-exif-cleared.jpeg");

    expect(result).toEqual(output);
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageExifClearSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const toFile = spyOn(pipeline, "toFile");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };
    const adapter = await ImageExifClearSharpAdapter.build(deps);

    await adapter.clear(recipe);
    const temporary = tools.FilePathRelative.fromString("images/pic-exif-cleared.png");

    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - relative", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageExifClearSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const toFile = spyOn(pipeline, "toFile");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("in/source.jpeg");
    const output = tools.FilePathRelative.fromString("out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };
    const adapter = await ImageExifClearSharpAdapter.build(deps);

    await adapter.clear(recipe);
    const temporary = tools.FilePathRelative.fromString("out/dest-exif-cleared.jpeg");

    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("missing dependency", async () => {
    spyOn(ImageExifClearSharpAdapter, "import").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => ImageExifClearSharpAdapter.build(deps)).toThrow(
      "image.exif.clear.sharp.adapter.error.missing.dependency",
    );
  });
});
