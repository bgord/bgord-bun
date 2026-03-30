import { describe, expect, test } from "bun:test";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

const payload = { timestamp: mocks.TIME_ZERO.ms };
const serialized = JSON.stringify(payload);

const serializer = new PayloadSerializerJsonAdapter();

describe("PayloadSerializerJsonAdapter", () => {
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
