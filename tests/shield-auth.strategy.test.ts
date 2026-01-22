import { describe, expect, spyOn, test } from "bun:test";
import type { betterAuth } from "better-auth";
import { Hono } from "hono";
import { ShieldAuthStrategy } from "../src/shield-auth.strategy";

const session = { id: "session-123" };
const user = { id: "user-123", email: "test@example.com" };

const auth = { api: { getSession: () => Promise.resolve(null) } } as unknown as ReturnType<typeof betterAuth>;

const strategy = new ShieldAuthStrategy(auth);

type Env = { Variables: { user: typeof user | null; session: typeof session | null } };

describe("ShieldAuthStrategy", () => {
  test("attach", async () => {
    // @ts-expect-error TODO - investigate
    const getSessionSpy = spyOn(auth.api, "getSession").mockResolvedValue({ session, user });
    const app = new Hono<Env>()
      .use(strategy.attach)
      .get("/", (c) => c.json({ user: c.get("user"), session: c.get("session") }));

    const response = await app.request("/", { headers: { cookie: "session_token=123" } });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json.user).toEqual(user);
    expect(json.session).toEqual(session);
    expect(getSessionSpy).toHaveBeenCalledWith({ headers: expect.any(Headers) });
  });

  test("attach - missing session", async () => {
    spyOn(auth.api, "getSession").mockResolvedValue(null);
    const app = new Hono<Env>()
      .use(strategy.attach)
      .get("/", (c) => c.json({ user: c.get("user"), session: c.get("session") }));

    const response = await app.request("/");
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json.user).toEqual(null);
    expect(json.session).toEqual(null);
  });

  test("verify - authenticated user", async () => {
    const app = new Hono<Env>()
      .use(async (context, next) => {
        context.set("user", user);
        await next();
      })
      .use(strategy.verify)
      .get("/", (c) => c.text("ok"));

    const response = await app.request("/");

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("verify - guest user", async () => {
    const app = new Hono<Env>()
      .use(async (context, next) => {
        context.set("user", null);
        await next();
      })
      .use(strategy.verify)
      .get("/", (c) => c.text("ok"))
      .onError((err, c) => c.json({ message: err.message }, 403));

    const response = await app.request("/");
    const json = await response.json();

    expect(response.status).toEqual(403);
    expect(json.message).toEqual("shield.auth");
  });

  test("reverse - guest user", async () => {
    const app = new Hono<Env>()
      .use(async (context, next) => {
        context.set("user", null);
        await next();
      })
      .use(strategy.reverse)
      .get("/", (c) => c.text("ok"));

    const response = await app.request("/");

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("reverse - authenticated user", async () => {
    const app = new Hono<Env>()
      .use(async (context, next) => {
        context.set("user", user);
        await next();
      })
      .use(strategy.reverse)
      .get("/", (c) => c.text("ok"))
      .onError((err, c) => c.json({ message: err.message }, 403));

    const response = await app.request("/");
    const json = await response.json();

    expect(response.status).toEqual(403);
    expect(json.message).toEqual("shield.auth");
  });
});
