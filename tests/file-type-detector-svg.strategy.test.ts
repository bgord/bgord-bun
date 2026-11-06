import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorSvgStrategy } from "../src/file-type-detector-svg.strategy";

const detector = new FileTypeDetectorSvgStrategy();

describe("FileTypeDetectorSvgStrategy", () => {
  test("happy path", async () => {
    const file = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.svg.mime);
  });

  test("ignores a BOM", async () => {
    const file = new File([new Uint8Array([0xef, 0xbb, 0xbf]), "<svg/>"], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.svg.mime);
  });

  test("ignores whitespace", async () => {
    const file = new File(["\n  \t<svg/>"], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.svg.mime);
  });

  test("empty", async () => {
    const file = new File([""], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("xml prolog", async () => {
    const file = new File(['<?xml version="1.0"?><svg/>'], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("comment", async () => {
    const file = new File(["<!-- Generator --><svg/>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("svg doctype", async () => {
    const file = new File(["<!DOCTYPE svg><svg/>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("html doctype", async () => {
    const file = new File(["<!DOCTYPE html><svg/>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("html with an inline svg", async () => {
    const file = new File(["<html><body><svg/></body></html>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("uppercase root", async () => {
    const file = new File(["<SVG/>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("text before the root", async () => {
    const file = new File(["hello <svg/>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("png bytes", async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("root past the prefix is not matched", async () => {
    const file = new File([" ".repeat(1445), "<svg/>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("reads only the first 1445 bytes", async () => {
    const file = new File(["<svg/>"], "sample");
    const slice = spyOn(file, "slice");

    await detector.detect(file);

    expect(slice).toHaveBeenCalledWith(0, 1445);
  });
});
