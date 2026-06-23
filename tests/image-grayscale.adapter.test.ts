// cspell:ignore grayscaled
import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { ImageGrayscaleAdapter } from "../src/image-grayscale.adapter";
import type {
  ImageGrayscaleInPlaceStrategy,
  ImageGrayscaleOutputPathStrategy,
} from "../src/image-grayscale.port";
import { NonceProviderDeterministicAdapter } from "../src/nonce-provider-deterministic.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const grayscaled = new TextEncoder().encode("grayscale").buffer;

const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const NonceProvider = new NonceProviderDeterministicAdapter(tools.repeat(mocks.nonce, 4));
const deps = { FileRenamer, FileWriter, NonceProvider };

const adapter = new ImageGrayscaleAdapter(deps);

const image = {
  rotate: () => image,
  modulate: () => image,
  webp: () => ({ bytes: () => grayscaled }),
  png: () => ({ bytes: () => grayscaled }),
  jpeg: () => ({ bytes: () => grayscaled }),
};

describe("ImageGrayscaleAdapter", () => {
  test("in_place - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using modulate = spyOn(image, "modulate");
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageGrayscaleInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.absolute.input,
    };

    expect(await adapter.grayscale(recipe)).toEqual(testcase.images.in_place.absolute.input);
    expect(modulate).toHaveBeenCalledWith({ saturation: 0 });
    expect(write).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("grayscale").get(),
      grayscaled,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("grayscale"),
      testcase.images.in_place.absolute.input,
    );
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using modulate = spyOn(image, "modulate");
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageGrayscaleInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.relative.input,
    };

    expect(await adapter.grayscale(recipe)).toEqual(testcase.images.in_place.relative.input);
    expect(modulate).toHaveBeenCalledWith({ saturation: 0 });
    expect(write).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("grayscale").get(),
      grayscaled,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("grayscale"),
      testcase.images.in_place.relative.input,
    );
  });

  test("output_path - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using modulate = spyOn(image, "modulate");
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageGrayscaleOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.absolute.input,
      output: testcase.images.output_path.absolute.output,
    };

    expect(await adapter.grayscale(recipe)).toEqual(testcase.images.output_path.absolute.output);
    expect(modulate).toHaveBeenCalledWith({ saturation: 0 });
    expect(write).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("grayscale").get(),
      grayscaled,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("grayscale"),
      testcase.images.output_path.absolute.output,
    );
  });

  test("jpg_to_jpeg", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using modulate = spyOn(image, "modulate");
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageGrayscaleInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.jpg_to_jpeg.input,
    };

    expect(await adapter.grayscale(recipe)).toEqual(testcase.images.jpg_to_jpeg.input);
    expect(modulate).toHaveBeenCalledWith({ saturation: 0 });
    expect(write).toHaveBeenCalledWith(testcase.images.jpg_to_jpeg.temporary("grayscale").get(), grayscaled);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.jpg_to_jpeg.temporary("grayscale"),
      testcase.images.jpg_to_jpeg.input,
    );
  });
});
