import { describe, expect, test } from "bun:test";
import { EventSerializerCollectingAdapter } from "../src/event-serializer-collecting.adapter";
import * as mocks from "./mocks";

const payload = { timestamp: mocks.TIME_ZERO.ms };
const serialized = JSON.stringify(payload);

describe("EventSerializerCollectingAdapter", () => {
  test("serialize", () => {
    const serializer = new EventSerializerCollectingAdapter();

    expect(serializer.serialize(payload)).toEqual(serialized);
    expect(serializer.serialized).toEqual([payload]);
  });

  test("deserialize", () => {
    const serializer = new EventSerializerCollectingAdapter();

    expect(serializer.deserialize(serialized)).toEqual(payload);
    expect(serializer.deserialized).toEqual([serialized]);
  });
});
