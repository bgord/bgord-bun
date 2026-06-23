import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { ImageBlurAdapter } from "../src/image-blur.adapter";
import type { ImageBlurStrategy } from "../src/image-blur.port";
import { NonceProviderDeterministicAdapter } from "../src/nonce-provider-deterministic.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const NonceProvider = new NonceProviderDeterministicAdapter(tools.repeat(mocks.nonce, 4));
const deps = { FileRenamer, FileWriter, NonceProvider };

const adapter = new ImageBlurAdapter(deps);

const base64 = "bW9jay1kYXRh";
const placeholder = `data:image/jpg;base64,${base64}`;
const buffer = Buffer.from(base64, "base64");
const image = {
  jpeg: () => ({ placeholder: async () => placeholder }),
  png: () => ({ placeholder: async () => placeholder }),
  webp: () => ({ placeholder: async () => placeholder }),
};

describe("ImageBlurAdapter", () => {
  test("in_place - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageBlurStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.absolute.input,
    };

    expect(await adapter.blur(recipe)).toEqual(testcase.images.in_place.absolute.input);
    expect(write).toHaveBeenCalledWith(testcase.images.in_place.absolute.temporary("blurred").get(), buffer);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("blurred"),
      testcase.images.in_place.absolute.input,
    );
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageBlurStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.relative.input,
    };

    expect(await adapter.blur(recipe)).toEqual(testcase.images.in_place.relative.input);
    expect(write).toHaveBeenCalledWith(testcase.images.in_place.relative.temporary("blurred").get(), buffer);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("blurred"),
      testcase.images.in_place.relative.input,
    );
  });

  test("output_path - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageBlurStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.absolute.input,
      output: testcase.images.output_path.absolute.output,
    };

    expect(await adapter.blur(recipe)).toEqual(testcase.images.output_path.absolute.output);
    expect(write).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("blurred").get(),
      buffer,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("blurred"),
      testcase.images.output_path.absolute.output,
    );
  });

  test("jpg_to_jpeg", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageBlurStrategy = {
      strategy: "in_place",
      input: testcase.images.jpg_to_jpeg.input,
    };

    expect(await adapter.blur(recipe)).toEqual(testcase.images.jpg_to_jpeg.input);
    expect(write).toHaveBeenCalledWith(testcase.images.jpg_to_jpeg.temporary("blurred").get(), buffer);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.jpg_to_jpeg.temporary("blurred"),
      testcase.images.jpg_to_jpeg.input,
    );
  });
});
