import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileUploaderMiddleware } from "../src/file-uploader.middleware";

const MimeRegistry = new tools.MimeRegistry([tools.Mimes.png, tools.Mimes.csv]);

const png = new File(["image"], "image.png", { type: "image/png" });
const csv = new File(["csv"], "data.csv", { type: "text/csv" });
const empty = new File([], "data.csv", { type: "text/csv" });
const invalid = new File(["document"], "document.pdf", { type: "application/pdf" });

const middleware = new FileUploaderMiddleware({ MimeRegistry, maxSize: tools.Size.fromKb(10) });

describe("FileUploaderMiddleware", () => {
  test("happy path - png", () => {
    expect(middleware.validate(png)).toEqual({ valid: true });
  });

  test("happy path - csv", () => {
    expect(middleware.validate(csv)).toEqual({ valid: true });
  });

  test("missing file", () => {
    expect(middleware.validate(null)).toEqual({ valid: false, error: "file.uploader.missing.file" });
  });

  test("empty file", () => {
    expect(middleware.validate(empty)).toEqual({ valid: false, error: "file.uploader.empty.file" });
  });

  test("size limit", () => {
    const middleware = new FileUploaderMiddleware({ MimeRegistry, maxSize: tools.Size.fromBytes(0) });

    expect(middleware.validate(png)).toEqual({ valid: false, error: "file.uploader.size.limit" });
  });

  test("invalid mime", () => {
    expect(middleware.validate(invalid)).toEqual({ valid: false, error: "file.uploader.invalid.mime" });
  });
});
