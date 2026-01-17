import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { FileUploader } from "../src/file-uploader.middleware";

const MimeRegistry = new tools.MimeRegistry([tools.Mimes.png, tools.Mimes.csv]);

const boundary = "----bun-test-boundary";
const headers = { "Content-Type": `multipart/form-data; boundary=${boundary}` };

const app = new Hono()
  .use(...FileUploader.validate({ MimeRegistry, maxFilesSize: tools.Size.fromKb(10) }))
  .post("/uploader", (c) => c.text("uploaded"));

describe("FileUploader middleware", () => {
  test("happy path", async () => {
    const content = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="image.png"',
      "Content-Type: image/png",
      "",
      "dummy-content",
      `--${boundary}--`,
      "",
    ].join("\r\n");

    const response = await app.request("/uploader", {
      method: "POST",
      body: new TextEncoder().encode(content),
      headers,
    });
    const text = await response.text();

    expect(response.status).toEqual(200);
    expect(text).toEqual("uploaded");
  });

  test("rejects invalid MIME type", async () => {
    const content = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="document.pdf"',
      "Content-Type: application/pdf",
      "",
      "pdf-content",
      `--${boundary}--`,
      "",
    ].join("\r\n");

    const response = await app.request("/uploader", {
      method: "POST",
      body: new TextEncoder().encode(content),
      headers,
    });
    const result = await response.text();

    expect(response.status).toEqual(400);
    expect(result).toEqual("file.uploader.invalid.mime");
  });

  test("rejects file too big", async () => {
    const content = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="too-big.txt"',
      "Content-Type: text/plain",
      "",
      "this content is larger than 10 bytes",
      `--${boundary}--`,
      "",
    ].join("\r\n");
    const app = new Hono()
      .use(
        ...FileUploader.validate({
          MimeRegistry: new tools.MimeRegistry([tools.Mimes.text]),
          maxFilesSize: tools.Size.fromBytes(1),
        }),
      )
      .post("/uploader", (c) => c.text("uploaded"));

    const response = await app.request("/uploader", {
      method: "POST",
      body: new TextEncoder().encode(content),
      headers,
    });
    const result = await response.text();

    expect(response.status).toEqual(400);
    expect(result).toEqual("file.uploader.too.big");
  });

  test("rejects no file", async () => {
    const content = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"',
      "",
      "invalid",
      `--${boundary}--`,
      "",
    ].join("\r\n");
    const app = new Hono()
      .use(
        ...FileUploader.validate({
          MimeRegistry: new tools.MimeRegistry([tools.Mimes.text]),
          maxFilesSize: tools.Size.fromKb(10),
        }),
      )
      .post("/uploader", (c) => c.text("uploaded"));

    const response = await app.request("/uploader", {
      method: "POST",
      body: new TextEncoder().encode(content),
      headers,
    });

    expect(response.status).toEqual(400);
    expect(await response.text()).toEqual("file.uploader.invalid.mime");
  });
});
