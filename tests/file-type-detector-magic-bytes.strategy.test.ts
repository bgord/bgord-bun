// cSpell:ignore ftypisom
import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorMagicBytesStrategy } from "../src/file-type-detector-magic-bytes.strategy";

const detector = new FileTypeDetectorMagicBytesStrategy();

const file = (...values: ReadonlyArray<number>) => new File([new Uint8Array(values)], "sample");
const ascii = (value: string) => [...value].map((char) => char.charCodeAt(0));

describe("FileTypeDetectorMagicBytesStrategy", () => {
  test("png", async () => {
    expect(await detector.detect(file(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toEqual(
      tools.Mimes.png.mime,
    );
  });

  test("jpg", async () => {
    expect(await detector.detect(file(0xff, 0xd8, 0xff, 0xe0))).toEqual(tools.Mimes.jpg.mime);
  });

  test("webp", async () => {
    expect(await detector.detect(file(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))).toEqual(
      tools.Mimes.webp.mime,
    );
  });

  test("wav", async () => {
    expect(await detector.detect(file(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WAVE")))).toEqual(
      tools.Mimes.wav.mime,
    );
  });

  test("mp4", async () => {
    expect(await detector.detect(file(0, 0, 0, 0x20, ...ascii("ftypisom")))).toEqual(tools.Mimes.mp4.mime);
  });

  test("pdf", async () => {
    expect(await detector.detect(file(...ascii("%PDF-1.7")))).toEqual(tools.Mimes.pdf.mime);
  });

  test("zip", async () => {
    expect(await detector.detect(file(0x50, 0x4b, 0x03, 0x04))).toEqual(tools.Mimes.zip.mime);
  });

  test("gzip", async () => {
    expect(await detector.detect(file(0x1f, 0x8b, 0x08))).toEqual(tools.Mimes.tar.mime);
  });

  test("unknown signature", async () => {
    expect(await detector.detect(file(...ascii("<!DOCTYPE html>")))).toEqual(null);
  });

  test("empty", async () => {
    expect(await detector.detect(file())).toEqual(null);
  });

  test("truncated signature", async () => {
    expect(await detector.detect(file(0x89, 0x50, 0x4e))).toEqual(null);
  });

  test("signature past the prefix is not matched", async () => {
    expect(await detector.detect(file(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toEqual(null);
  });
});
