import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { FileUploader } from "../src/file-uploader.middleware";

const boundary = "----bun-test-boundary";
const headers = { "Content-Type": `multipart/form-data; boundary=${boundary}` };

const app = new Hono()
  .use(
    ...FileUploader.validate({
      mimeTypes: [tools.MIMES.png, tools.MIMES.csv],
      maxFilesSize: tools.Size.fromKb(10),
    }),
  )
  .post("/uploader", (c) => c.text("uploaded"));

describe("FileUploader middleware", () => {
  test("accepts valid file upload", async () => {
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
      "fake-pdf-content",
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
    expect(result).toEqual("invalid_file_mime_type_error");
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
      .use(...FileUploader.validate({ mimeTypes: [tools.MIMES.text], maxFilesSize: tools.Size.fromBytes(1) }))
      .post("/uploader", (c) => c.text("uploaded"));

    const response = await app.request("/uploader", {
      method: "POST",
      body: new TextEncoder().encode(content),
      headers,
    });
    const result = await response.text();

    expect(response.status).toEqual(400);
    expect(result).toEqual("file_too_big_error");
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
      .use(...FileUploader.validate({ mimeTypes: [tools.MIMES.png], maxFilesSize: tools.Size.fromKb(10) }))
      .post("/uploader", (c) => c.text("uploaded"));

    const response = await app.request("/uploader", {
      method: "POST",
      body: new TextEncoder().encode(content),
      headers,
    });

    expect(response.status).toEqual(400);
    expect(await response.text()).toEqual("invalid_file_mime_type_error");
  });
});
