import { describe, expect, test } from "bun:test";
import express from "express";
import request from "supertest";
import { AuthSessionReaderNoopAdapter } from "../src/auth-session-reader-noop.adapter";
import { ShieldAuthExpressStrategy } from "../src/shield-auth-express.strategy";

const user = { id: "user-123", email: "test@example.com" };
const session = { id: "session-123" };

describe("ShieldAuthExpressStrategy", () => {
  test("attach", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthExpressStrategy({ AuthSessionReader });
    const app = express()
      .use(strategy.attach)
      .get("/", (req, res) => res.json({ user: req.user, session: req.session }));

    const response = await request(app).get("/").set("cookie", "session_token=123");

    expect(response.status).toEqual(200);
    expect(response.body.user).toEqual(user);
    expect(response.body.session).toEqual(session);
  });

  test("attach - missing session", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthExpressStrategy({ AuthSessionReader });
    const app = express()
      .use(strategy.attach)
      .get("/", (req, res) => res.json({ user: req.user, session: req.session }));

    const response = await request(app).get("/");

    expect(response.status).toEqual(200);
    expect(response.body.user).toEqual(null);
    expect(response.body.session).toEqual(null);
  });

  test("verify - authenticated user", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthExpressStrategy({ AuthSessionReader });
    const app = express()
      .use((req, _res, next) => {
        req.user = user;
        next();
      })
      .use(strategy.verify)
      .get("/", (_req, res) => res.send("ok"));

    const response = await request(app).get("/");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("verify - guest user", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthExpressStrategy({ AuthSessionReader });
    const app = express()
      .use((req, _res, next) => {
        req.user = null;
        next();
      })
      .use(strategy.verify)
      .get("/", (_req, res) => res.send("ok"));

    const response = await request(app).get("/");

    expect(response.status).toEqual(403);
    expect(response.body.message).toEqual("shield.auth.rejected");
  });

  test("reverse - guest user", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthExpressStrategy({ AuthSessionReader });
    const app = express()
      .use((req, _res, next) => {
        req.user = null;
        next();
      })
      .use(strategy.reverse)
      .get("/", (_req, res) => res.send("ok"));

    const response = await request(app).get("/");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
  });

  test("reverse - authenticated user", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthExpressStrategy({ AuthSessionReader });
    const app = express()
      .use((req, _res, next) => {
        req.user = user;
        next();
      })
      .use(strategy.reverse)
      .get("/", (_req, res) => res.send("ok"));

    const response = await request(app).get("/");

    expect(response.status).toEqual(403);
    expect(response.body.message).toEqual("shield.auth.rejected");
  });
});
