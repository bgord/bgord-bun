import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageBlurStrategy } from "../src/image-blur.port";
import { ImageBlurSharpAdapter } from "../src/image-blur-sharp.adapter";
import * as mocks from "./mocks";

const pipeline = {
  rotate: () => pipeline,
  blur: (_?: number) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

describe("ImageBlurSharpAdapter", () => {
  test("in_place", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(ImageBlurSharpAdapter, "import").mockResolvedValue({ default: () => pipeline });
    using rotate = spyOn(pipeline, "rotate");
    using blur = spyOn(pipeline, "blur");
    using toFormat = spyOn(pipeline, "toFormat");
    using toFile = spyOn(pipeline, "toFile");
    using destroy = spyOn(pipeline, "destroy");
    using rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input };
    const adapter = await ImageBlurSharpAdapter.build(deps);

    const result = await adapter.blur(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-blurred.jpg");

    expect(result).toEqual(input);
    expect(blur).toHaveBeenCalledWith(undefined);
    expect(rotate).toHaveBeenCalledTimes(1);
    expect(toFormat).toHaveBeenCalledWith("jpeg");
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(ImageBlurSharpAdapter, "import").mockResolvedValue({ default: () => pipeline });
    using blur = spyOn(pipeline, "blur");
    using toFormat = spyOn(pipeline, "toFormat");
    using toFile = spyOn(pipeline, "toFile");
    using destroy = spyOn(pipeline, "destroy");
    using rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 2.5 };
    const adapter = await ImageBlurSharpAdapter.build(deps);

    const result = await adapter.blur(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/out/dest-blurred.webp");

    expect(result).toEqual(output);
    expect(blur).toHaveBeenCalledWith(2.5);
    expect(toFormat).toHaveBeenCalledWith("webp");
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(ImageBlurSharpAdapter, "import").mockResolvedValue({ default: () => pipeline });
    using toFormat = spyOn(pipeline, "toFormat");
    using toFile = spyOn(pipeline, "toFile");
    using destroy = spyOn(pipeline, "destroy");
    using rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input, sigma: 1 };
    const adapter = await ImageBlurSharpAdapter.build(deps);

    const result = await adapter.blur(recipe);
    const temporary = tools.FilePathRelative.fromString("images/pic-blurred.png");

    expect(result.get()).toEqual(input.get());
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(toFormat).toHaveBeenCalledWith("png");
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path - jpeg to jpg", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(ImageBlurSharpAdapter, "import").mockResolvedValue({ default: () => pipeline });
    using toFormat = spyOn(pipeline, "toFormat");
    using rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 0.7 };
    const adapter = await ImageBlurSharpAdapter.build(deps);

    await adapter.blur(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/x/out/photo-blurred.jpg");

    expect(toFormat).toHaveBeenCalledWith("jpeg");
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("missing dependency", async () => {
    using _ = spyOn(ImageBlurSharpAdapter, "import").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => ImageBlurSharpAdapter.build(deps)).toThrow(
      "image.blur.sharp.adapter.error.missing.dependency",
    );
  });
});
