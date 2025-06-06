import { describe, expect, spyOn, test } from "bun:test";
import { Lucia } from "lucia";

import { SessionId } from "../src/session-id";

const luciaStub = {
  readSessionCookie: (cookie: string) => (cookie === "valid" ? "session_123" : null),
} as unknown as Lucia;

describe("SessionId", () => {
  test("returns session ID if cookie is valid", () => {
    const luciaReadSessionCookie = spyOn(luciaStub, "readSessionCookie");

    const session = new SessionId("valid", luciaStub);
    const result = session.get();

    expect(result).toBe("session_123");
    expect(luciaReadSessionCookie).toHaveBeenCalledWith("valid");

    luciaReadSessionCookie.mockRestore();
  });

  test("returns null if cookie is missing", () => {
    const luciaReadSessionCookie = spyOn(luciaStub, "readSessionCookie");

    const session = new SessionId(undefined, luciaStub);
    const result = session.get();

    expect(result).toBe(null);
    expect(luciaReadSessionCookie).toHaveBeenCalledWith("");

    luciaReadSessionCookie.mockRestore();
  });

  test("returns null if cookie is invalid", () => {
    const luciaReadSessionCookie = spyOn(luciaStub, "readSessionCookie");

    const session = new SessionId("invalid", luciaStub);
    const result = session.get();

    expect(result).toBe(null);
    expect(luciaReadSessionCookie).toHaveBeenCalledWith("invalid");

    luciaReadSessionCookie.mockRestore();
  });
});
