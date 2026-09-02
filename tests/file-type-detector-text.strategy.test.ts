import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorTextStrategy } from "../src/file-type-detector-text.strategy";

const detector = new FileTypeDetectorTextStrategy(tools.Mimes.csv.mime);

const file = (content: string | Uint8Array<ArrayBuffer>) => new File([content], "sample");

describe("FileTypeDetectorTextStrategy", () => {
  test("happy path", async () => {
    expect(await detector.detect(file("id,name\n1,John\n"))).toEqual(tools.Mimes.csv.mime);
  });

  test("accented characters", async () => {
    expect(await detector.detect(file("id,name\n1,Zoë\n"))).toEqual(tools.Mimes.csv.mime);
  });

  test("empty", async () => {
    expect(await detector.detect(file(""))).toEqual(null);
  });

  test("null byte", async () => {
    expect(await detector.detect(file(new Uint8Array([0x69, 0x64, 0x00, 0x6e])))).toEqual(null);
  });

  test("png bytes", async () => {
    expect(
      await detector.detect(file(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))),
    ).toEqual(null);
  });

  test("invalid utf-8", async () => {
    expect(await detector.detect(file(new Uint8Array([0xc3, 0x28])))).toEqual(null);
  });

  test("html", async () => {
    expect(await detector.detect(file("<!DOCTYPE html><p>hi</p>"))).toEqual(null);
  });

  test("html - leading whitespace and lowercase", async () => {
    expect(await detector.detect(file("\n  <script>alert(1)</script>"))).toEqual(null);
  });

  test("svg", async () => {
    expect(await detector.detect(file('<svg xmlns="http://www.w3.org/2000/svg" />'))).toEqual(null);
  });

  test("markup later in the file", async () => {
    expect(await detector.detect(file("id,name\n1,<b>John</b>\n"))).toEqual(tools.Mimes.csv.mime);
  });
});
