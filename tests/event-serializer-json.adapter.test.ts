import { describe, expect, test } from "bun:test";
import { EventSerializerJsonAdapter } from "../src/event-serializer-json.adapter";
import * as mocks from "./mocks";

const payload = { timestamp: mocks.TIME_ZERO.ms };
const serialized = JSON.stringify(payload);

const serializer = new EventSerializerJsonAdapter();

describe("EventSerializerJsonAdapter", () => {
  test("serialize", () => {
    expect(serializer.serialize(payload)).toEqual(serialized);
  });

  test("deserialize", () => {
    expect(serializer.deserialize(serialized)).toEqual(payload);
  });

  test("round-trip", () => {
    expect(serializer.deserialize(serializer.serialize(payload))).toEqual(payload);
  });
});
