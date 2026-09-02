// cSpell:ignore ftypisom
import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorMagicBytesStrategy } from "../src/file-type-detector-magic-bytes.strategy";

const detector = new FileTypeDetectorMagicBytesStrategy();

describe("FileTypeDetectorMagicBytesStrategy", () => {
  test("png", async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.png.mime);
  });

  test("jpg", async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.jpg.mime);
  });

  test("webp", async () => {
    const file = new File(["RIFF", new Uint8Array([0, 0, 0, 0]), "WEBP"], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.webp.mime);
  });

  test("wav", async () => {
    const file = new File(["RIFF", new Uint8Array([0, 0, 0, 0]), "WAVE"], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.wav.mime);
  });

  test("mp4", async () => {
    const file = new File([new Uint8Array([0, 0, 0, 0x20]), "ftypisom"], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.mp4.mime);
  });

  test("pdf", async () => {
    const file = new File(["%PDF-1.7"], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.pdf.mime);
  });

  test("zip", async () => {
    const file = new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04])], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.zip.mime);
  });

  test("gzip", async () => {
    const file = new File([new Uint8Array([0x1f, 0x8b, 0x08])], "sample");

    expect(await detector.detect(file)).toEqual(tools.Mimes.tar.mime);
  });

  test("unknown signature", async () => {
    const file = new File(["<!DOCTYPE html>"], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("empty", async () => {
    const file = new File([new Uint8Array()], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("truncated signature", async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e])], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });

  test("reads only the first 12 bytes", async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "sample");
    const slice = spyOn(file, "slice");

    await detector.detect(file);

    expect(slice).toHaveBeenCalledWith(0, 12);
  });

  test("signature past the prefix is not matched", async () => {
    const file = new File([new Uint8Array([0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "sample");

    expect(await detector.detect(file)).toEqual(null);
  });
});
