import { expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";

import {
  FileTooBigError,
  FileUploader,
  InvalidFileMimeTypeError,
} from "../src/file-uploader";

const boundary = "----bun-test-boundary";

const headers = {
  "Content-Type": `multipart/form-data; boundary=${boundary}`,
};

test("accepts valid file upload", async () => {
  const app = new Hono();

  app.use(
    ...FileUploader.validate({
      mimeTypes: ["image/png"],
      maxFilesSize: new tools.Size({
        value: 10,
        unit: tools.SizeUnit.kB,
      }).toBytes(),
    }),
  );

  app.post("/uploader", (c) => c.text("uploaded"));

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

  expect(response.status).toBe(200);
  expect(text).toBe("uploaded");
});

test("rejects invalid MIME type", async () => {
  const app = new Hono();

  const maxFilesSize = new tools.Size({
    value: 10,
    unit: tools.SizeUnit.kB,
  }).toBytes();

  app.use(...FileUploader.validate({ mimeTypes: ["image/png"], maxFilesSize }));

  app.post("/uploader", (c) => c.text("uploaded"));

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

  expect(response.status).toBe(400);
  expect(result).toBe(InvalidFileMimeTypeError.message);
});

test("rejects file too big", async () => {
  const app = new Hono();

  const maxFilesSize = new tools.Size({
    value: 1,
    unit: tools.SizeUnit.b,
  }).toBytes();

  app.use(
    ...FileUploader.validate({ mimeTypes: ["text/plain"], maxFilesSize }),
  );

  app.post("/uploader", (c) => c.text("uploaded"));

  const content = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="too-big.txt"',
    "Content-Type: text/plain",
    "",
    "this content is larger than 10 bytes",
    `--${boundary}--`,
    "",
  ].join("\r\n");

  const response = await app.request("/uploader", {
    method: "POST",
    body: new TextEncoder().encode(content),
    headers,
  });
  const result = await response.text();

  expect(response.status).toBe(400);
  expect(result).toBe(FileTooBigError.message);
});
