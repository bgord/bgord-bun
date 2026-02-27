import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { FileUploader } from "../src/file-uploader.middleware";

const MimeRegistry = new tools.MimeRegistry([tools.Mimes.png, tools.Mimes.csv]);

const png = new File([], "image.png");
const pdf = new File([], "image.pdf");
const empty = new File([], "image.pdf");

const app = new Hono()
  .use(...FileUploader.validate({ MimeRegistry, maxFilesSize: tools.Size.fromKb(10) }))
  .post("/uploader", (c) => c.text("uploaded"));

describe("FileUploader middleware", () => {
  test("happy path", async () => {
    const form = new FormData();
    form.append("file", png);

    const response = await app.request("/uploader", { method: "POST", body: form });
    const text = await response.text();

    expect(response.status).toEqual(200);
    expect(text).toEqual("uploaded");
  });

  test("rejects invalid MIME type", async () => {
    const form = new FormData();
    form.append("file", pdf);

    const response = await app.request("/uploader", { method: "POST", body: form });
    const result = await response.text();

    expect(response.status).toEqual(400);
    expect(result).toEqual("file.uploader.invalid.mime");
  });

  test("rejects file too big", async () => {
    const form = new FormData();
    form.append("file", png);

    const app = new Hono()
      .use(
        ...FileUploader.validate({
          MimeRegistry: new tools.MimeRegistry([tools.Mimes.text]),
          maxFilesSize: tools.Size.fromBytes(1),
        }),
      )
      .post("/uploader", (c) => c.text("uploaded"));

    const response = await app.request("/uploader", { method: "POST", body: form });
    const result = await response.text();

    expect(response.status).toEqual(400);
    expect(result).toEqual("file.uploader.too.big");
  });

  test("rejects no file", async () => {
    const form = new FormData();
    form.append("file", empty);

    const app = new Hono()
      .use(
        ...FileUploader.validate({
          MimeRegistry: new tools.MimeRegistry([tools.Mimes.text]),
          maxFilesSize: tools.Size.fromKb(10),
        }),
      )
      .post("/uploader", (c) => c.text("uploaded"));

    const response = await app.request("/uploader", { method: "POST", body: form });

    expect(response.status).toEqual(400);
    expect(await response.text()).toEqual("file.uploader.invalid.mime");
  });
});
