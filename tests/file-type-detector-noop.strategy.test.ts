import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorNoopStrategy } from "../src/file-type-detector-noop.strategy";

const file = new Uint8Array();

describe("FileTypeDetectorNoopStrategy", () => {
  test("happy path", () => {
    expect(new FileTypeDetectorNoopStrategy(tools.Mimes.png.mime).detect(file)).toEqual(tools.Mimes.png.mime);
  });

  test("default", () => {
    expect(new FileTypeDetectorNoopStrategy().detect(file)).toEqual(null);
  });
});
