import { describe, expect, test } from "bun:test";
import { EventSerializerCollectingAdapter } from "../src/event-serializer-collecting.adapter";
import * as mocks from "./mocks";

const payload = { timestamp: mocks.TIME_ZERO.ms };
const another = { timestamp: 1700000001000 };
const serialized = JSON.stringify(payload);

const serializer = new EventSerializerCollectingAdapter();

describe("EventSerializerCollectingAdapter", () => {
  test("serialize", () => {
    expect(serializer.serialize(payload)).toEqual(serialized);
  });

  test("deserialize", () => {
    expect(serializer.deserialize(serialized)).toEqual(payload);
  });

  test("serialize - collects payload", () => {
    const serializer = new EventSerializerCollectingAdapter();

    serializer.serialize(payload);

    expect(serializer.serialized).toEqual([payload]);
  });

  test("deserialize - collects raw", () => {
    const serializer = new EventSerializerCollectingAdapter();

    serializer.deserialize(serialized);

    expect(serializer.deserialized).toEqual([serialized]);
  });

  test("collects multiple calls", () => {
    const serializer = new EventSerializerCollectingAdapter();

    serializer.serialize(payload);
    serializer.serialize(another);

    expect(serializer.serialized).toEqual([payload, another]);
  });
});
