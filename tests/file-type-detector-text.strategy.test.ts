import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorTextStrategy } from "../src/file-type-detector-text.strategy";

const detector = new FileTypeDetectorTextStrategy(tools.Mimes.csv.mime);

describe("FileTypeDetectorTextStrategy", () => {
  test("happy path", () => {
    expect(detector.detect(new TextEncoder().encode("id,name\n1,John\n"))).toEqual(tools.Mimes.csv.mime);
  });

  test("accented characters", () => {
    expect(detector.detect(new TextEncoder().encode("id,name\n1,Zoë\n"))).toEqual(tools.Mimes.csv.mime);
  });

  test("empty", () => {
    expect(detector.detect(new Uint8Array())).toEqual(null);
  });

  test("null byte", () => {
    expect(detector.detect(new Uint8Array([0x69, 0x64, 0x00, 0x6e]))).toEqual(null);
  });

  test("png bytes", () => {
    expect(detector.detect(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toEqual(null);
  });

  test("invalid utf-8", () => {
    expect(detector.detect(new Uint8Array([0xc3, 0x28]))).toEqual(null);
  });

  test("html", () => {
    expect(detector.detect(new TextEncoder().encode("<!DOCTYPE html><p>hi</p>"))).toEqual(null);
  });

  test("html - leading whitespace and lowercase", () => {
    expect(detector.detect(new TextEncoder().encode("\n  <script>alert(1)</script>"))).toEqual(null);
  });

  test("svg", () => {
    expect(detector.detect(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" />'))).toEqual(
      null,
    );
  });

  test("markup later in the file", () => {
    expect(detector.detect(new TextEncoder().encode("id,name\n1,<b>John</b>\n"))).toEqual(
      tools.Mimes.csv.mime,
    );
  });
});
