import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorFixedStrategy } from "../src/file-type-detector-fixed.strategy";

const file = new Uint8Array();

describe("FileTypeDetectorFixedStrategy", () => {
  test("happy path", () => {
    expect(new FileTypeDetectorFixedStrategy(tools.Mimes.png.mime).detect(file)).toEqual(
      tools.Mimes.png.mime,
    );
  });

  test("null", () => {
    expect(new FileTypeDetectorFixedStrategy(null).detect(file)).toEqual(null);
  });
});
