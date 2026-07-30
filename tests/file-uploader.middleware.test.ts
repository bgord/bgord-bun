import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileUploaderMiddleware } from "../src/file-uploader.middleware";
import { RequestContextBuilder } from "./request-context-builder";

const MimeRegistry = new tools.MimeRegistry([tools.Mimes.png, tools.Mimes.csv]);

const png = new FormData();
png.append("file", new File(["image"], "image.png", { type: "image/png" }));

const csv = new FormData();
csv.append("file", new File(["csv"], "data.csv", { type: "text/csv" }));

const missing = new FormData();

const empty = new FormData();
empty.append("file", new File([], "data.csv", { type: "text/csv" }));

const invalid = new FormData();
invalid.append("file", new File(["document"], "document.pdf", { type: "application/pdf" }));

const middleware = new FileUploaderMiddleware({
  MimeRegistry,
  maxSize: tools.Size.fromKb(10),
  field: "file",
});

describe("FileUploaderMiddleware", () => {
  test("happy path - png", async () => {
    const context = new RequestContextBuilder().withForm(png).build();

    expect(await middleware.validate(context)).toEqual({ valid: true });
  });

  test("happy path - csv", async () => {
    const context = new RequestContextBuilder().withForm(csv).build();

    expect(await middleware.validate(context)).toEqual({ valid: true });
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
    const middleware = new FileUploaderMiddleware({
      MimeRegistry,
      maxSize: tools.Size.fromBytes(0),
      field: "file",
    });
    const context = new RequestContextBuilder().withForm(png).build();

    expect(await middleware.validate(context)).toEqual({ valid: false, error: "file.uploader.size.limit" });
  });

  test("invalid mime", async () => {
    const context = new RequestContextBuilder().withForm(invalid).build();

    expect(await middleware.validate(context)).toEqual({ valid: false, error: "file.uploader.invalid.mime" });
  });
});
