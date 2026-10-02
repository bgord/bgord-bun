import { describe, expect, spyOn, test } from "bun:test";
import { AtomicFileWriterNoopAdapter } from "../src/atomic-file-writer-noop.adapter";
import { ImageBlurAdapter } from "../src/image-blur.adapter";
import type { ImageBlurStrategy } from "../src/image-blur.port";
import * as testcase from "./testcases";

const AtomicFileWriter = new AtomicFileWriterNoopAdapter();
const deps = { AtomicFileWriter };

const adapter = new ImageBlurAdapter(deps);

const base64 = "bW9jay1kYXRh";
const placeholder = `data:image/png;base64,${base64}`;
const buffer = Buffer.from(base64, "base64");
const image = { placeholder: async () => placeholder };

describe("ImageBlurAdapter", () => {
  test("output_path - absolute", async () => {
    // @ts-expect-error Partial access
    using file = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");

    const recipe: ImageBlurStrategy = {
      input: testcase.images.output_path.absolute.input,
      output: testcase.images.output_path.absolute.output,
    };

    expect(await adapter.blur(recipe)).toEqual(testcase.images.output_path.absolute.output);
    expect(file).toHaveBeenCalledWith(testcase.images.output_path.absolute.input.get());
    expect(write).toHaveBeenCalledWith(testcase.images.output_path.absolute.output, buffer);
  });

  test("output_path - relative", async () => {
    // @ts-expect-error Partial access
    using file = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");

    const recipe: ImageBlurStrategy = {
      input: testcase.images.output_path.relative.input,
      output: testcase.images.output_path.relative.output,
    };

    expect(await adapter.blur(recipe)).toEqual(testcase.images.output_path.relative.output);
    expect(file).toHaveBeenCalledWith(testcase.images.output_path.relative.input.get());
    expect(write).toHaveBeenCalledWith(testcase.images.output_path.relative.output, buffer);
  });

  test("jpg_to_jpeg", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");

    const recipe: ImageBlurStrategy = {
      input: testcase.images.output_path.absolute.input,
      output: testcase.images.jpg_to_jpeg.input,
    };

    expect(await adapter.blur(recipe)).toEqual(testcase.images.jpg_to_jpeg.input);
    expect(write).toHaveBeenCalledWith(testcase.images.jpg_to_jpeg.input, buffer);
  });
});
