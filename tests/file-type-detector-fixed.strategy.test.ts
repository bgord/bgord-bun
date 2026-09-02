import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorFixedStrategy } from "../src/file-type-detector-fixed.strategy";

const file = new File([], "sample");

describe("FileTypeDetectorFixedStrategy", () => {
  test("happy path", async () => {
    expect(await new FileTypeDetectorFixedStrategy(tools.Mimes.png.mime).detect(file)).toEqual(
      tools.Mimes.png.mime,
    );
  });

  test("null", async () => {
    expect(await new FileTypeDetectorFixedStrategy(null).detect(file)).toEqual(null);
  });
});
