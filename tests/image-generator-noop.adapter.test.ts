import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ImageGeneratorNoopAdapter } from "../src/image-generator-noop.adapter";
import * as mocks from "./mocks";

const config = {
  template: "",
  filename: tools.Filename.fromParts(mocks.TIME_ZERO.ms.toString(), "png"),
  width: v.parse(tools.ImageWidth, 800),
  height: v.parse(tools.ImageHeight, 600),
};

describe("ImageGeneratorNoopAdapter", () => {
  test("default", async () => {
    const adapter = new ImageGeneratorNoopAdapter();

    const result = await adapter.generate(config);

    expect(result).toEqual(new Uint8Array([]));
  });

  test("custom", async () => {
    const value = new Uint8Array([1, 2, 3]);
    const adapter = new ImageGeneratorNoopAdapter(value);

    const result = await adapter.generate(config);

    expect(result).toBe(value);
  });
});
