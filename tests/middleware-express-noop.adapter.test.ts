import { describe, expect, test } from "bun:test";
import express from "express";
import request from "supertest";
import { MiddlewareExpressNoopAdapter } from "../src/middleware-express-noop.adapter";

describe("MiddlewareExpressNoopAdapter", () => {
  test("happy path", async () => {
    const shield = new MiddlewareExpressNoopAdapter();
    const app = express()
      .use(shield.handle())
      .post("/secure", (_, response) => response.send("OK"));

    const response = await request(app).post("/secure").send();

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("OK");
  });
});
