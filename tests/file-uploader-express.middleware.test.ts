import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { FileUploaderExpressMiddleware } from "../src/file-uploader-express.middleware";

const MimeRegistry = new tools.MimeRegistry([tools.Mimes.png, tools.Mimes.csv]);

const uploader = new FileUploaderExpressMiddleware({ MimeRegistry, maxSize: tools.Size.fromKb(10) });
const app = express()
  .use(uploader.handle())
  .post("/uploader", (_request, response) => response.send("uploaded"));

describe("FileUploaderExpressMiddleware", () => {
  test("happy path - png", async () => {
    const response = await request(app).post("/uploader").attach("file", Buffer.from("image"), "image.png");

    expect(response.text).toEqual("uploaded");
    expect(response.status).toEqual(200);
  });

  test("happy path - csv", async () => {
    const response = await request(app).post("/uploader").attach("file", Buffer.from("csv"), "data.csv");

    expect(response.text).toEqual("uploaded");
    expect(response.status).toEqual(200);
  });

  test("missing file", async () => {
    const response = await request(app).post("/uploader");

    expect(response.status).toEqual(400);
    expect(response.text).toEqual("file.uploader.missing.file");
  });

  test("empty file", async () => {
    const response = await request(app).post("/uploader").attach("file", Buffer.from([]), "data.csv");

    expect(response.text).toEqual("file.uploader.empty.file");
    expect(response.status).toEqual(400);
  });

  test("size limit", async () => {
    const uploader = new FileUploaderExpressMiddleware({ MimeRegistry, maxSize: tools.Size.fromBytes(0) });
    const app = express()
      .use(uploader.handle())
      .post("/uploader", (_request, response) => response.send("uploaded"));

    const response = await request(app).post("/uploader").attach("file", Buffer.from("image"), "image.png");

    expect(response.text).toEqual("file.uploader.size.limit");
    expect(response.status).toEqual(400);
  });

  test("invalid mime", async () => {
    const response = await request(app)
      .post("/uploader")
      .attach("file", Buffer.from("document"), "document.pdf");

    expect(response.text).toEqual("file.uploader.invalid.mime");
    expect(response.status).toEqual(400);
  });
});
