import { describe, expect, spyOn, test } from "bun:test";
import type { betterAuth } from "better-auth";
import { AuthSessionReaderBetterAuthAdapter } from "../src/auth-session-reader-better-auth.adapter";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const signedIn = { user: mocks.user, session: mocks.session };
const signedOut = null;

describe("AuthSessionReaderBetterAuthAdapter", () => {
  test("signed in", async () => {
    const context = new RequestContextBuilder().withHeader("cookie", "session=abc").build();
    const auth = { api: { getSession: async () => signedIn } } as ReturnType<typeof betterAuth>;
    const adapter = new AuthSessionReaderBetterAuthAdapter(auth);
    const getSessionSpy = spyOn(auth.api, "getSession");

    expect(await adapter.getSession(context)).toEqual(signedIn);
    expect(getSessionSpy).toHaveBeenCalledWith({ headers: new Headers({ cookie: "session=abc" }) });
  });

  test("signed out", async () => {
    const context = new RequestContextBuilder().build();
    const auth = { api: { getSession: async () => signedOut } } as ReturnType<typeof betterAuth>;
    const adapter = new AuthSessionReaderBetterAuthAdapter(auth);
    const getSessionSpy = spyOn(auth.api, "getSession");

    expect(await adapter.getSession(context)).toEqual({ user: null, session: null });
    expect(getSessionSpy).toHaveBeenCalledWith({ headers: new Headers() });
  });
});
