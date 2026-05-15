import { describe, expect, test } from "bun:test";
import { ImageGeneratorNoopAdapter } from "../src/image-generator-noop.adapter";

const config = {
  template: "",
  filename: {} as never,
  width: 0 as never,
  height: 0 as never,
};

describe("ImageGeneratorNoopAdapter", () => {
  test("default", async () => {
    const adapter = new ImageGeneratorNoopAdapter();

    const result = await adapter.generate(config.template, config.filename, config.width, config.height);

    expect(result).toEqual(new Uint8Array([]));
  });

  test("custom", async () => {
    const value = new Uint8Array([1, 2, 3]);
    const adapter = new ImageGeneratorNoopAdapter(value);

    const result = await adapter.generate(config.template, config.filename, config.width, config.height);

    expect(result).toBe(value);
  });
});
