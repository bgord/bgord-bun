import { expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { Lucia } from "lucia";

import { AuthShield } from "../src/auth-shield";
import { Password } from "../src/passwords";

const mockLucia = {
  readSessionCookie: (cookie: string) => (cookie === "valid" ? "session-id" : null),
  validateSession: async (sessionId: string) =>
    sessionId === "session-id"
      ? { session: { id: "session-id", fresh: true }, user: { id: "user-id" } }
      : { session: null, user: null },
  createBlankSessionCookie: () => ({
    serialize: () => "blank-session-cookie",
  }),
  createSessionCookie: (id: string) => ({
    serialize: () => `session-cookie-${id}`,
  }),
  invalidateSession: async (_id: string) => {},
  createSession: async (_userId: string) => ({ id: "session-id" }),
} as unknown as Lucia;

const password = (await new Password("password").hash()).read();

const testUser = { id: "user-id", password };

const auth = new AuthShield({
  lucia: mockLucia,
  findUniqueUserOrThrow: async () => testUser,
});

test("verify denies access if no user", async () => {
  const app = new Hono();

  app.use("/secure", auth.verify);
  app.get("/secure", (c) => c.text("ok"));

  const res = await app.request("/secure");
  expect(res.status).toBe(403);
});

test("reverse denies access if user exists", async () => {
  const app = new Hono();

  app.use("/reverse", (c, next) => {
    // @ts-expect-error
    c.set("user", { id: "user-id" });
    return next();
  });
  app.use("/reverse", auth.reverse);
  app.get("/reverse", (c) => c.text("should not reach here"));

  const res = await app.request("/reverse");
  expect(res.status).toBe(403);
});

test("detach invalidates session if cookie exists", async () => {
  const invalidateSpy = spyOn(mockLucia, "invalidateSession");

  const app = new Hono();
  app.use("/detach", auth.detach);
  app.get("/detach", (c) => c.text("done"));

  const res = await app.request("/detach", {
    headers: { cookie: "valid" },
  });

  expect(res.status).toBe(200);
  expect(await res.text()).toBe("done");
  expect(invalidateSpy).toHaveBeenCalledWith("session-id");
});

test("build sets user and session when session is valid", async () => {
  const app = new Hono();

  app.use("/build", auth.build);
  app.get("/build", (c) => {
    // @ts-expect-error
    const user = c.get("user");
    // @ts-expect-error
    const session = c.get("session");
    return c.json({ user, session });
  });

  const res = await app.request("/build", {
    headers: { cookie: "valid" },
  });

  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json.user).toEqual({ id: "user-id" });
  expect(json.session).toEqual({ id: "session-id", fresh: true });
});

test("attach logs in user with valid credentials", async () => {
  const app = new Hono();

  app.use("/login", auth.attach);
  app.post("/login", (c) => c.text("ok"));

  const form = new FormData();
  form.append("username", "user");
  form.append("password", "password");

  const res = await app.request("/login", {
    method: "POST",
    body: form,
  });

  expect(res.status).toBe(200);
  expect(await res.text()).toBe("ok");
  expect(res.headers.get("Set-Cookie")).toContain("session-cookie-session-id");
});
