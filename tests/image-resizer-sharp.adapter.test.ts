import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageResizerInPlaceStrategy, ImageResizerOutputPathStrategy } from "../src/image-resizer.port";
import { ImageResizerSharpAdapter } from "../src/image-resizer-sharp.adapter";
import * as mocks from "./mocks";

const pipeline = {
  rotate: () => pipeline,
  resize: (_opts: any) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

describe("ImageResizerSharpAdapter", () => {
  test("in_place", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageResizerSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const rotate = spyOn(pipeline, "rotate");
    const resize = spyOn(pipeline, "resize");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageResizerInPlaceStrategy = {
      strategy: "in_place",
      input,
      maxSide: tools.ImageWidth.parse(512),
    };
    const adapter = await ImageResizerSharpAdapter.build(deps);

    const result = await adapter.resize(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-resized.jpg");

    expect(resize).toHaveBeenCalledWith({ width: 512, height: 512, fit: "inside", withoutEnlargement: true });
    expect(toFormat).toHaveBeenCalledWith("jpeg");
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(result).toEqual(input);
    expect(rotate).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageResizerSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const resize = spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormat = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFile = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageResizerOutputPathStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide: tools.ImageWidth.parse(256),
    };
    const adapter = await ImageResizerSharpAdapter.build(deps);

    const result = await adapter.resize(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/out/dest-resized.webp");

    expect(result).toEqual(output);
    expect(resize).toHaveBeenCalledWith({ width: 256, height: 256, fit: "inside", withoutEnlargement: true });
    expect(toFormat).toHaveBeenCalledWith("webp");
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageResizerSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFile = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageResizerInPlaceStrategy = {
      strategy: "in_place",
      input,
      maxSide: tools.ImageWidth.parse(128),
    };
    const adapter = await ImageResizerSharpAdapter.build(deps);

    await adapter.resize(recipe);
    const temporary = tools.FilePathRelative.fromString("images/pic-resized.png");

    expect(toFormat).toHaveBeenCalledWith("png");
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - jpg to jpeg", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageResizerSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/a/in.jpeg");
    const output = tools.FilePathAbsolute.fromString("/b/out/photo.jpg");
    const recipe: ImageResizerOutputPathStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide: tools.ImageWidth.parse(300),
    };
    const adapter = await ImageResizerSharpAdapter.build(deps);

    await adapter.resize(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/b/out/photo-resized.jpg");

    expect(toFormat).toHaveBeenCalledWith("jpeg");
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("missing dependency", async () => {
    spyOn(ImageResizerSharpAdapter, "import").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(ImageResizerSharpAdapter.build(deps)).rejects.toThrow(
      "image.resizer.sharp.adapter.error.missing.dependency",
    );
  });
});
