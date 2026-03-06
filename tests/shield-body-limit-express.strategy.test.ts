import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { ShieldBodyLimitExpressStrategy } from "../src/shield-body-limit-express.strategy";

const maxSize = tools.Size.fromKb(100);
const shield = new ShieldBodyLimitExpressStrategy({ maxSize });

const app = express()
  .use(shield.handle())
  .post("/upload", (_request, response) => response.send("ok"));

describe("ShieldBodyLimitExpressStrategy", () => {
  test("happy path - below limit", async () => {
    const body = "x".repeat(tools.Size.fromKb(50).toBytes());

    const response = await request(app).post("/upload").set("content-type", "text/plain").send(body);

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("happy path - at the limit", async () => {
    const body = "x".repeat(tools.Size.fromKb(100).toBytes());

    const response = await request(app).post("/upload").set("content-type", "text/plain").send(body);

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("over the limit", async () => {
    const body = "x".repeat(tools.Size.fromKb(101).toBytes());

    const response = await request(app).post("/upload").set("content-type", "text/plain").send(body);

    expect(response.status).toEqual(413);
    expect(response.text).toEqual("shield.body.limit.rejected");
  });

  test("no header - empty body", async () => {
    const response = await request(app).post("/upload");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("invalid header", async () => {
    const response = await request(app).post("/upload").set("content-length", "invalid");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("negative header", async () => {
    const response = await request(app).post("/upload").set("content-length", "-100");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });
});
