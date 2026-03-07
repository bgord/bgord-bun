import { describe, expect, test } from "bun:test";
import express from "express";
import request from "supertest";
import { PingExpressHandler } from "../src/ping-express.handler";

describe("PingExpressHandler", () => {
  test("happy path", async () => {
    const ping = new PingExpressHandler();
    const app = express().get("/ping", ping.handle());

    const response = await request(app).get("/ping");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("pong");
  });
});
