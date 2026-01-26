import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageAlphaStrategy } from "../src/image-alpha.port";
import { ImageAlphaSharpAdapter } from "../src/image-alpha-sharp.adapter";
import * as mocks from "./mocks";

const pipeline = {
  rotate: () => pipeline,
  flatten: (_: any) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

describe("ImageAlphaSharpAdapter", () => {
  test("in_place", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageAlphaSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const rotate = spyOn(pipeline, "rotate");
    const flatten = spyOn(pipeline, "flatten");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#F8FAFC" };
    const adapter = await ImageAlphaSharpAdapter.build(deps);

    const output = await adapter.flatten(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-flattened.jpg");

    expect(output).toEqual(input);
    expect(flatten).toHaveBeenCalledWith({ background: "#F8FAFC" });
    expect(rotate).toHaveBeenCalledTimes(1);
    expect(toFormat).toHaveBeenCalledWith("jpeg");
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageAlphaSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const flatten = spyOn(pipeline, "flatten");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const background = { r: 248, g: 250, b: 252, alpha: 1 };
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background };
    const adapter = await ImageAlphaSharpAdapter.build(deps);

    const result = await adapter.flatten(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/out/dest-flattened.webp");

    expect(flatten).toHaveBeenCalledWith({ background: background });
    expect(toFormat).toHaveBeenCalledWith("webp");
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
    expect(result).toEqual(output);
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageAlphaSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFile = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#000" };
    const adapter = await ImageAlphaSharpAdapter.build(deps);

    await adapter.flatten(recipe);
    const temporary = tools.FilePathRelative.fromString("images/pic-flattened.png");

    expect(toFormat).toHaveBeenCalledWith("png");
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - jpeg to jpg", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageAlphaSharpAdapter, "import").mockResolvedValue(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background: "#fff" };
    const adapter = await ImageAlphaSharpAdapter.build(deps);

    await adapter.flatten(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/x/out/photo-flattened.jpg");

    expect(toFormat).toHaveBeenCalledWith("jpeg");
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("missing dependency", async () => {
    spyOn(ImageAlphaSharpAdapter, "import").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => ImageAlphaSharpAdapter.build(deps)).toThrow(
      "image.alpha.sharp.adapter.error.missing.dependency",
    );
  });
});
