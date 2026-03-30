import { describe, expect, test } from "bun:test";
import { EventFinderNoopAdapter } from "../src/event-finder-noop.adapter";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

const serializer = new PayloadSerializerJsonAdapter();
const serialized = {
  ...mocks.GenericHourHasPassedEvent,
  payload: serializer.serialize(mocks.GenericHourHasPassedEvent.payload),
};

const finder = new EventFinderNoopAdapter([serialized]);

describe("EventFinderNoopAdapter", () => {
  test("find", async () => {
    expect(
      await finder.find(mocks.GenericHourHasPassedEvent.stream, [mocks.GenericHourHasPassedEvent.name]),
    ).toEqual([serialized]);
  });
});
