import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorTextStrategy } from "../src/file-type-detector-text.strategy";

const detector = new FileTypeDetectorTextStrategy(tools.Mimes.csv.mime);

describe("FileTypeDetectorTextStrategy", () => {
  test("happy path", async () => {
    const file = new File(["id,name\n1,John Doe\n"], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.csv.mime);
  });

  test("accented characters", async () => {
    const file = new File(["id,name\n1,Zoë\n"], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.csv.mime);
  });

  test("empty", async () => {
    const file = new File([""], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("null byte", async () => {
    const file = new File([new Uint8Array([0x69, 0x64, 0x00, 0x6e])], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("delete byte", async () => {
    const file = new File([new Uint8Array([0x69, 0x64, 0x7f, 0x6e])], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("control byte past the prefix is not inspected", async () => {
    const file = new File(["a".repeat(1445), new Uint8Array([0x00])], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.csv.mime);
  });

  test("png bytes", async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("invalid utf-8", async () => {
    const file = new File([new Uint8Array([0xc3, 0x28])], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("html", async () => {
    const file = new File(["<!DOCTYPE html><p>hi</p>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("html - leading whitespace and lowercase", async () => {
    const file = new File(["\n  <script>alert(1)</script>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("svg", async () => {
    const file = new File(['<svg xmlns="http://www.w3.org/2000/svg" />'], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("markup later in the file", async () => {
    const file = new File(["id,name\n1,<b>John</b>\n"], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.csv.mime);
  });
});
