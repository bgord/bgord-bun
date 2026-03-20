import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type {
  ImageGrayscaleInPlaceStrategy,
  ImageGrayscaleOutputPathStrategy,
} from "../src/image-grayscale.port";
import { ImageGrayscaleSharpAdapter } from "../src/image-grayscale-sharp.adapter";
import * as mocks from "./mocks";

const pipeline = {
  rotate: () => pipeline,
  grayscale: () => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

describe("ImageGrayscaleSharpAdapter", () => {
  test("in_place", async () => {
    // @ts-expect-error Private method
    using _ = spyOn(ImageGrayscaleSharpAdapter["importer"], "import").mockResolvedValue({
      // @ts-expect-error Partial access
      default: () => pipeline,
    });
    using rotate = spyOn(pipeline, "rotate");
    using grayscale = spyOn(pipeline, "grayscale");
    using toFile = spyOn(pipeline, "toFile");
    using destroy = spyOn(pipeline, "destroy");
    using rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpeg");
    const recipe: ImageGrayscaleInPlaceStrategy = { strategy: "in_place", input };
    const adapter = await ImageGrayscaleSharpAdapter.build(deps);

    const result = await adapter.grayscale(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-grayscale.jpeg");

    expect(result).toEqual(input);
    expect(rotate).toHaveBeenCalledTimes(1);
    expect(grayscale).toHaveBeenCalledTimes(1);
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    // @ts-expect-error Private method
    using _ = spyOn(ImageGrayscaleSharpAdapter["importer"], "import").mockResolvedValue({
      // @ts-expect-error Partial access
      default: () => pipeline,
    });
    using grayscale = spyOn(pipeline, "grayscale");
    using toFile = spyOn(pipeline, "toFile");
    using destroy = spyOn(pipeline, "destroy");
    using rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.jpeg");
    const recipe: ImageGrayscaleOutputPathStrategy = { strategy: "output_path", input, output };
    const adapter = await ImageGrayscaleSharpAdapter.build(deps);

    const result = await adapter.grayscale(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/out/dest-grayscale.jpeg");

    expect(result).toEqual(output);
    expect(grayscale).toHaveBeenCalledTimes(1);
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Private method
    using _ = spyOn(ImageGrayscaleSharpAdapter["importer"], "import").mockResolvedValue({
      // @ts-expect-error Partial access
      default: () => pipeline,
    });
    using toFile = spyOn(pipeline, "toFile");
    using rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageGrayscaleInPlaceStrategy = { strategy: "in_place", input };
    const adapter = await ImageGrayscaleSharpAdapter.build(deps);

    await adapter.grayscale(recipe);
    const temporary = tools.FilePathRelative.fromString("images/pic-grayscale.png");

    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - relative", async () => {
    // @ts-expect-error Private method
    using _ = spyOn(ImageGrayscaleSharpAdapter["importer"], "import").mockResolvedValue({
      // @ts-expect-error Partial access
      default: () => pipeline,
    });
    using toFile = spyOn(pipeline, "toFile");
    using rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("in/source.jpeg");
    const output = tools.FilePathRelative.fromString("out/dest.jpeg");
    const recipe: ImageGrayscaleOutputPathStrategy = { strategy: "output_path", input, output };
    const adapter = await ImageGrayscaleSharpAdapter.build(deps);

    await adapter.grayscale(recipe);
    const temporary = tools.FilePathRelative.fromString("out/dest-grayscale.jpeg");

    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("missing dependency", async () => {
    // @ts-expect-error Private method
    using _ = spyOn(ImageGrayscaleSharpAdapter["importer"], "import").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    expect(async () => ImageGrayscaleSharpAdapter.build(deps)).toThrow(
      "image.grayscale.sharp.adapter.error.missing.dependency",
    );
  });

  test("import", async () => {
    // @ts-expect-error Private method
    using obfuscateSpy = spyOn(ImageGrayscaleSharpAdapter["importer"], "obfuscate");

    await ImageGrayscaleSharpAdapter.build(deps);

    expect(obfuscateSpy).toHaveBeenCalledWith("sharp");
  });
});
