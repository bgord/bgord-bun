import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorMagicBytesStrategy } from "../src/file-type-detector-magic-bytes.strategy";

const detector = new FileTypeDetectorMagicBytesStrategy();

const bytes = (...values: ReadonlyArray<number>) => new Uint8Array(values);
const ascii = (value: string) => [...value].map((char) => char.charCodeAt(0));

describe("FileTypeDetectorMagicBytesStrategy", () => {
  test("png", () => {
    expect(detector.detect(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toEqual(
      tools.Mimes.png.mime,
    );
  });

  test("jpg", () => {
    expect(detector.detect(bytes(0xff, 0xd8, 0xff, 0xe0))).toEqual(tools.Mimes.jpg.mime);
  });

  test("webp", () => {
    expect(detector.detect(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))).toEqual(
      tools.Mimes.webp.mime,
    );
  });

  test("wav", () => {
    expect(detector.detect(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WAVE")))).toEqual(
      tools.Mimes.wav.mime,
    );
  });

  test("mp4", () => {
    expect(detector.detect(bytes(0, 0, 0, 0x20, ...ascii("ftypisom")))).toEqual(tools.Mimes.mp4.mime);
  });

  test("pdf", () => {
    expect(detector.detect(bytes(...ascii("%PDF-1.7")))).toEqual(tools.Mimes.pdf.mime);
  });

  test("zip", () => {
    expect(detector.detect(bytes(0x50, 0x4b, 0x03, 0x04))).toEqual(tools.Mimes.zip.mime);
  });

  test("gzip", () => {
    expect(detector.detect(bytes(0x1f, 0x8b, 0x08))).toEqual(tools.Mimes.tar.mime);
  });

  test("unknown signature", () => {
    expect(detector.detect(bytes(...ascii("<!DOCTYPE html>")))).toEqual(null);
  });

  test("empty", () => {
    expect(detector.detect(bytes())).toEqual(null);
  });

  test("truncated signature", () => {
    expect(detector.detect(bytes(0x89, 0x50, 0x4e))).toEqual(null);
  });

  test("signature past the prefix is not matched", () => {
    expect(detector.detect(bytes(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toEqual(null);
  });
});
