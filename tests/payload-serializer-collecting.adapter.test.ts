import { describe, expect, test } from "bun:test";
import { PayloadSerializerCollectingAdapter } from "../src/payload-serializer-collecting.adapter";
import * as mocks from "./mocks";

const payload = { timestamp: mocks.TIME_ZERO.ms };
const serialized = JSON.stringify(payload);

describe("PayloadSerializerCollectingAdapter", () => {
  test("serialize", () => {
    const serializer = new PayloadSerializerCollectingAdapter();

    expect(serializer.serialize(payload)).toEqual(serialized);
    expect(serializer.serialized).toEqual([payload]);
  });

  test("deserialize", () => {
    const serializer = new PayloadSerializerCollectingAdapter();

    expect(serializer.deserialize(serialized)).toEqual(payload);
    expect(serializer.deserialized).toEqual([serialized]);
  });
});
