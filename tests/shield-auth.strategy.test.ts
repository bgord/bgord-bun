import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import {
  AuthSessionReaderNoopAdapter,
  type AuthSessionReaderNoopSessionType,
  type AuthSessionReaderNoopUserType,
} from "../src/auth-session-reader-noop.adapter";
import { ShieldAuthStrategy } from "../src/shield-auth.strategy";

const user = { id: "user-123", email: "test@example.com" };
const session = { id: "session-123" };

type Env = {
  Variables: { user: AuthSessionReaderNoopUserType | null; session: AuthSessionReaderNoopSessionType | null };
};

describe("ShieldAuthStrategy", () => {
  test("attach", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });
    const app = new Hono<Env>()
      .use(strategy.attach)
      .get("/", (c) => c.json({ user: c.get("user"), session: c.get("session") }));

    const response = await app.request("/", { headers: { cookie: "session_token=123" } });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json.user).toEqual(user);
    expect(json.session).toEqual(session);
  });

  test("attach - missing session", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });
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
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });
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
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });
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
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });
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
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });
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
