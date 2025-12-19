import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { ShieldUserAgentBlockerAdapter } from "../src/shield-user-agent-blocker.adapter";
import * as mocks from "./mocks";

const shield = new ShieldUserAgentBlockerAdapter();

const app = new Hono().use(shield.verify).get("/ping", (c) => c.text("OK"));

describe("ShieldBasicAuthAdapter", () => {
  test("happy path", async () => {
    const result = await app.request(
      "/ping",
      { method: "GET", headers: new Headers({ "user-agent": "Firefox" }) },
      mocks.ip,
    );

    expect(result.status).toEqual(200);
  });

  test("happy path - no user agent", async () => {
    const result = await app.request("/ping", { method: "GET" }, mocks.ip);

    expect(result.status).toEqual(200);
  });

  test("denied", async () => {
    const result = await app.request(
      "/ping",
      { method: "GET", headers: new Headers({ "user-agent": "AI2Bot-DeepResearchEval" }) },
      mocks.ip,
    );

    expect(result.status).toEqual(403);
  });
});
