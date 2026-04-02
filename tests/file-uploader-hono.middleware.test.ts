import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { FileUploaderHonoMiddleware } from "../src/file-uploader-hono.middleware";

const MimeRegistry = new tools.MimeRegistry([tools.Mimes.png, tools.Mimes.csv]);

const png = new File(["image"], "image.png", { type: "image/png" });
const csv = new File(["csv"], "data.csv", { type: "text/csv" });
const empty = new File([], "data.csv", { type: "text/csv" });
const invalid = new File(["document"], "document.pdf", { type: "application/pdf" });

const uploader = new FileUploaderHonoMiddleware({
  MimeRegistry,
  maxSize: tools.Size.fromKb(10),
  field: "file",
});
const app = new Hono().use(uploader.handle()).post("/uploader", (c) => c.text("uploaded"));

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

    const response = await app.request("/uploader", { method: "POST", body: form });

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
    const uploader = new FileUploaderHonoMiddleware({
      MimeRegistry,
      maxSize: tools.Size.fromBytes(0),
      field: "file",
    });
    const app = new Hono().use(uploader.handle()).post("/uploader", (c) => c.text("uploaded"));

    const form = new FormData();
    form.append("file", png);

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(await response.text()).toEqual("file.uploader.size.limit");
    expect(response.status).toEqual(400);
  });

  test("invalid mime", async () => {
    const form = new FormData();
    form.append("file", invalid);

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(await response.text()).toEqual("file.uploader.invalid.mime");
    expect(response.status).toEqual(400);
  });
});
