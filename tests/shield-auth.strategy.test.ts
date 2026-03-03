import { describe, expect, test } from "bun:test";
import { AuthSessionReaderNoopAdapter } from "../src/auth-session-reader-noop.adapter";
import { ShieldAuthStrategy } from "../src/shield-auth.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const user = { id: "user-123", email: "test@example.com" };
const session = { id: "session-123" };

describe("ShieldAuthStrategy", () => {
  test("attach", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });
    const context = new RequestContextBuilder().withHeader("cookie", "session_token=123").build();

    const result = await strategy.attach(context);

    expect(result.user).toEqual(user);
    expect(result.session).toEqual(session);
  });

  test("attach - missing session", async () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });
    const context = new RequestContextBuilder().build();

    const result = await strategy.attach(context);

    expect(result.user).toEqual(null);
    expect(result.session).toEqual(null);
  });

  test("verify - authenticated user", () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });

    expect(strategy.verify(user)).toEqual(true);
  });

  test("verify - guest user", () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });

    expect(strategy.verify(null)).toEqual(false);
  });

  test("reverse - guest user", () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: null, session: null });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });

    expect(strategy.reverse(null)).toEqual(true);
  });

  test("reverse - authenticated user", () => {
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const strategy = new ShieldAuthStrategy({ AuthSessionReader });

    expect(strategy.reverse(user)).toEqual(false);
  });
});
