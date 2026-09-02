import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorMagicBytesStrategy } from "../src/file-type-detector-magic-bytes.strategy";
import { FileTypeDetectorTextStrategy } from "../src/file-type-detector-text.strategy";
import { FileUploaderMiddleware } from "../src/file-uploader.middleware";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const png = new FormData();
png.append("file", new File([new Uint8Array(mocks.PNG_BYTES)], "image.png", { type: "image/png" }));

const csv = new FormData();
csv.append("file", new File(["id,name\n1,John\n"], "data.csv", { type: "text/csv" }));

const missing = new FormData();

const empty = new FormData();
empty.append("file", new File([], "data.csv", { type: "text/csv" }));

const pdf = new FormData();
pdf.append("file", new File(["%PDF-1.7"], "document.pdf", { type: "application/pdf" }));

const spoofed = new FormData();
spoofed.append(
  "file",
  new File(["<!DOCTYPE html><script>alert(1)</script>"], "image.png", {
    type: "image/png",
  }),
);

const middleware = new FileUploaderMiddleware(
  { MimeRegistry: new tools.MimeRegistry([tools.Mimes.png]), maxSize: tools.Size.fromKb(10), field: "file" },
  { FileTypeDetector: new FileTypeDetectorMagicBytesStrategy() },
);

const textMiddleware = new FileUploaderMiddleware(
  { MimeRegistry: new tools.MimeRegistry([tools.Mimes.csv]), maxSize: tools.Size.fromKb(10), field: "file" },
  { FileTypeDetector: new FileTypeDetectorTextStrategy(tools.Mimes.csv.mime) },
);

describe("FileUploaderMiddleware", () => {
  test("happy path - png", async () => {
    const context = new RequestContextBuilder().withForm(png).build();

    expect(await middleware.validate(context)).toEqual({ valid: true });
  });

  test("happy path - csv", async () => {
    const context = new RequestContextBuilder().withForm(csv).build();

    expect(await textMiddleware.validate(context)).toEqual({ valid: true });
  });

  test("missing file", async () => {
    const context = new RequestContextBuilder().withForm(missing).build();

    expect(await middleware.validate(context)).toEqual({ valid: false, error: "file.uploader.missing.file" });
  });

  test("empty file", async () => {
    const context = new RequestContextBuilder().withForm(empty).build();

    expect(await middleware.validate(context)).toEqual({ valid: false, error: "file.uploader.empty.file" });
  });

  test("size limit", async () => {
    const middleware = new FileUploaderMiddleware(
      {
        MimeRegistry: new tools.MimeRegistry([tools.Mimes.png]),
        maxSize: tools.Size.fromBytes(0),
        field: "file",
      },
      { FileTypeDetector: new FileTypeDetectorMagicBytesStrategy() },
    );
    const context = new RequestContextBuilder().withForm(png).build();

    expect(await middleware.validate(context)).toEqual({ valid: false, error: "file.uploader.size.limit" });
  });

  test("invalid mime - detected but not in the registry", async () => {
    const context = new RequestContextBuilder().withForm(pdf).build();

    expect(await middleware.validate(context)).toEqual({ valid: false, error: "file.uploader.invalid.mime" });
  });

  test("invalid mime - spoofed content type", async () => {
    const context = new RequestContextBuilder().withForm(spoofed).build();

    expect(await middleware.validate(context)).toEqual({ valid: false, error: "file.uploader.invalid.mime" });
  });

  test("invalid mime - undetectable content", async () => {
    const context = new RequestContextBuilder().withForm(csv).build();

    expect(await middleware.validate(context)).toEqual({ valid: false, error: "file.uploader.invalid.mime" });
  });
});
