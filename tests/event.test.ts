import { describe, expect, test } from "bun:test";

import { Event, ParsedEvent } from "../src/event";
import { NewUUID } from "../src/new-uuid";

const validUUID = NewUUID.generate();
const now = new Date();
const payload = { userId: 123, action: "clicked" };
describe("Event", () => {
  test("Event: parses and transforms valid input", () => {
    const input = {
      id: validUUID,
      createdAt: now,
      stream: "user.interaction",
      name: "button_click",
      version: 1,
      payload,
    };

    const result = Event.parse(input);
    expect(result.id).toBe(validUUID);
    expect(result.createdAt).toBe(now);
    expect(result.stream).toBe("user.interaction");
    expect(result.name).toBe("button_click");
    expect(result.version).toBe(1);
    expect(typeof result.payload).toBe("string");
    expect(JSON.parse(result.payload)).toEqual(payload);
  });

  test("ParsedEvent: parses and preserves object payload", () => {
    const input = {
      id: validUUID,
      createdAt: now,
      stream: "audit.log",
      name: "file_upload",
      version: 2,
      payload,
    };

    const result = ParsedEvent.parse(input);
    expect(result.payload).toEqual(payload);
  });

  test("Event: fails with invalid JSON payload", () => {
    const circular: any = {};
    circular.self = circular;

    const input = {
      id: validUUID,
      createdAt: now,
      stream: "bad.stream",
      name: "bad_payload",
      version: 1,
      payload: circular,
    };

    expect(() => Event.parse(input)).toThrow();
  });

  test("Event: fails with empty name or stream", () => {
    const input = {
      id: validUUID,
      createdAt: now,
      stream: "",
      name: "",
      version: 1,
      payload,
    };

    expect(() => Event.parse(input)).toThrow();
  });
});
