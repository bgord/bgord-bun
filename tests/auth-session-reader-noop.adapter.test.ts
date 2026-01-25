import { describe, expect, test } from "bun:test";
import { AuthSessionReaderNoopAdapter } from "../src/auth-session-reader-noop.adapter";
import { RequestContextBuilder } from "./request-context-builder";

const context = new RequestContextBuilder().build();

describe("AuthSessionReaderNoop", () => {
  test("get session - signed in", async () => {
    const user = { id: "user-123", email: "test@example.com" };
    const session = { id: "session-123" };

    const adapter = new AuthSessionReaderNoopAdapter(user, session);

    expect(await adapter.getSession(context)).toEqual({ user, session });
  });

  test("get session - signed out", async () => {
    const adapter = new AuthSessionReaderNoopAdapter(null, null);

    expect(await adapter.getSession(context)).toEqual({ user: null, session: null });
  });
});
