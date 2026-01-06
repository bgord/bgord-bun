import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { ShieldCsrfStrategy } from "../src/shield-csrf.strategy";

const APP_ORIGIN = "http://localhost:3000";
const EVIL_ORIGIN = "https://evil.example";

const app = new Hono()
  .use(new ShieldCsrfStrategy({ origins: [APP_ORIGIN] }).verify)
  .get("/ping", (c) => c.text("ok"))
  .post("/action", (c) => c.text("ok"))
  .put("/action", (c) => c.text("ok"))
  .patch("/action", (c) => c.text("ok"))
  .delete("/action", (c) => c.text("ok"));

describe("ShieldCsrfStrategy", () => {
  test("safe method - allowed - no origin", async () => {
    const response = await app.request("/ping");

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  test("safe method - allowed - good origin", async () => {
    const response = await app.request("/ping", { headers: { Origin: APP_ORIGIN } });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  test("safe method - allowed - bad origin", async () => {
    const response = await app.request("/ping", { headers: { Origin: EVIL_ORIGIN } });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  test("state-changing - allowed - no origin", async () => {
    const response = await app.request("/action", { method: "POST" });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  test("state-changing - allowed - good origin", async () => {
    const response = await app.request("/action", { method: "POST", headers: { Origin: APP_ORIGIN } });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  test("state-changing - POST - not allowed - wrong origin", async () => {
    const response = await app.request("/action", { method: "POST", headers: { Origin: EVIL_ORIGIN } });

    expect(response.status).toBe(403);
    expect(await response.text()).toContain("shield.csrf");
  });

  test("state-changing - PUT - not allowed - wrong origin", async () => {
    const response = await app.request("/action", { method: "PUT", headers: { Origin: EVIL_ORIGIN } });

    expect(response.status).toBe(403);
    expect(await response.text()).toContain("shield.csrf");
  });

  test("state-changing - PATCH - not allowed - wrong origin", async () => {
    const response = await app.request("/action", { method: "PATCH", headers: { Origin: EVIL_ORIGIN } });

    expect(response.status).toBe(403);
    expect(await response.text()).toContain("shield.csrf");
  });

  test("state-changing - DELETE - not allowed - wrong origin", async () => {
    const response = await app.request("/action", { method: "DELETE", headers: { Origin: EVIL_ORIGIN } });

    expect(response.status).toBe(403);
    expect(await response.text()).toContain("shield.csrf");
  });
});
