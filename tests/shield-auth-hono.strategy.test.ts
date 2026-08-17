import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import {
  AuthSessionReaderNoopAdapter,
  type AuthSessionReaderNoopSessionType,
  type AuthSessionReaderNoopUserType,
} from "../src/auth-session-reader-noop.adapter";
import { ShieldAuthHonoStrategy } from "../src/shield-auth-hono.strategy";

const user = { id: "user-123", email: "test@example.com" };
const session = { id: "session-123" };

type Env = {
  Variables: { user: AuthSessionReaderNoopUserType | null; session: AuthSessionReaderNoopSessionType | null };
};

const onError = () => new Response("internal error", { status: 500 });

describe("ShieldAuthHonoStrategy", () => {
  test("attach", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const app = new Hono<Env>()
      .use(strategy.attach)
      .get("/", (c) => Response.json({ user: c.get("user"), session: c.get("session") }));

    const response = await app.request("/", { headers: { cookie: "session_token=123" } });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json.user).toEqual(user);
    expect(json.session).toEqual(session);
  });

  test("attach - missing session", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const app = new Hono<Env>()
      .use(strategy.attach)
      .get("/", (c) => Response.json({ user: c.get("user"), session: c.get("session") }));

    const response = await app.request("/");
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json.user).toEqual(null);
    expect(json.session).toEqual(null);
  });

  test("verify - authenticated user", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const app = new Hono<Env>()
      .use(async (context, next) => {
        context.set("user", user);
        await next();
      })
      .use(strategy.verify)
      .get("/", () => new Response("ok"));

    const response = await app.request("/");

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("verify - guest user", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const app = new Hono<Env>()
      .use(async (context, next) => {
        context.set("user", null);
        await next();
      })
      .use(strategy.verify)
      .get("/", () => new Response("ok"));

    const response = await app.request("/");

    expect(response.status).toEqual(401);
    expect(await response.text()).toEqual("shield.auth.rejected");
  });

  test("verify - no attached", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const app = new Hono<Env>()
      .use(strategy.verify)
      .get("/", () => new Response("ok"))
      .onError(onError);

    const response = await app.request("/");

    expect(response.status).toEqual(500);
  });

  test("reverse - guest user", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const app = new Hono<Env>()
      .use(async (context, next) => {
        context.set("user", null);
        await next();
      })
      .use(strategy.reverse)
      .get("/", () => new Response("ok"));

    const response = await app.request("/");

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("reverse - no attached", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const app = new Hono<Env>()
      .use(strategy.reverse)
      .get("/", () => new Response("ok"))
      .onError(onError);

    const response = await app.request("/");

    expect(response.status).toEqual(500);
  });

  test("reverse - authenticated user", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const app = new Hono<Env>()
      .use(async (context, next) => {
        context.set("user", user);
        await next();
      })
      .use(strategy.reverse)
      .get("/", () => new Response("ok"));

    const response = await app.request("/");

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.auth.rejected");
  });
});
