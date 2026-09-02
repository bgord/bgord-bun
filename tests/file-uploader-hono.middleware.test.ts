import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { FileTypeDetectorMagicBytesStrategy } from "../src/file-type-detector-magic-bytes.strategy";
import { FileTypeDetectorTextStrategy } from "../src/file-type-detector-text.strategy";
import { FileUploaderHonoMiddleware } from "../src/file-uploader-hono.middleware";
import * as mocks from "./mocks";

const png = new File([new Uint8Array(mocks.PNG_BYTES)], "image.png", { type: "image/png" });
const csv = new File(["id,name\n1,John\n"], "data.csv", { type: "text/csv" });
const empty = new File([], "data.csv", { type: "text/csv" });
const pdf = new File(["%PDF-1.7"], "document.pdf", { type: "application/pdf" });
const spoofed = new File(["<!DOCTYPE html><script>alert(1)</script>"], "image.png", { type: "image/png" });

const uploader = new FileUploaderHonoMiddleware(
  { MimeRegistry: new tools.MimeRegistry([tools.Mimes.png]), maxSize: tools.Size.fromKb(10), field: "file" },
  { FileTypeDetector: new FileTypeDetectorMagicBytesStrategy() },
);
const app = new Hono().use(uploader.handle()).post("/uploader", () => new Response("uploaded"));

const textUploader = new FileUploaderHonoMiddleware(
  { MimeRegistry: new tools.MimeRegistry([tools.Mimes.csv]), maxSize: tools.Size.fromKb(10), field: "file" },
  { FileTypeDetector: new FileTypeDetectorTextStrategy(tools.Mimes.csv.mime) },
);
const textApp = new Hono().use(textUploader.handle()).post("/uploader", () => new Response("uploaded"));

describe("FileUploaderHonoMiddleware", () => {
  test("happy path - png", async () => {
    const form = new FormData();
    form.append("file", png);

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(await response.text()).toEqual("uploaded");
    expect(response.status).toEqual(200);
  });

  test("happy path - csv", async () => {
    const form = new FormData();
    form.append("file", csv);

    const response = await textApp.request("/uploader", { method: "POST", body: form });

    expect(await response.text()).toEqual("uploaded");
    expect(response.status).toEqual(200);
  });

  test("missing file", async () => {
    const form = new FormData();

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(response.status).toEqual(400);
    expect(await response.text()).toEqual("file.uploader.missing.file");
  });

  test("empty file", async () => {
    const form = new FormData();
    form.set("file", empty);

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(await response.text()).toEqual("file.uploader.empty.file");
    expect(response.status).toEqual(400);
  });

  test("size limit", async () => {
    const uploader = new FileUploaderHonoMiddleware(
      {
        MimeRegistry: new tools.MimeRegistry([tools.Mimes.png]),
        maxSize: tools.Size.fromBytes(0),
        field: "file",
      },
      { FileTypeDetector: new FileTypeDetectorMagicBytesStrategy() },
    );
    const app = new Hono().use(uploader.handle()).post("/uploader", () => new Response("uploaded"));

    const form = new FormData();
    form.append("file", png);

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(await response.text()).toEqual("file.uploader.size.limit");
    expect(response.status).toEqual(400);
  });

  test("invalid mime - detected but not in the registry", async () => {
    const form = new FormData();
    form.append("file", pdf);

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(await response.text()).toEqual("file.uploader.invalid.mime");
    expect(response.status).toEqual(400);
  });

  test("invalid mime - spoofed content type", async () => {
    const form = new FormData();
    form.append("file", spoofed);

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(await response.text()).toEqual("file.uploader.invalid.mime");
    expect(response.status).toEqual(400);
  });

  test("invalid mime - undetectable content", async () => {
    const form = new FormData();
    form.append("file", csv);

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(await response.text()).toEqual("file.uploader.invalid.mime");
    expect(response.status).toEqual(400);
  });
});
