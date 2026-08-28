import { describe, expect, test } from "bun:test";
import { EventFinderLastNoopAdapter } from "../src/event-finder-last-noop.adapter";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

const serializer = new PayloadSerializerJsonAdapter();
const serialized = {
  ...mocks.GenericHourHasPassedEvent,
  payload: serializer.serialize(mocks.GenericHourHasPassedEvent.payload),
};

describe("EventFinderLastNoopAdapter", () => {
  test("findLast", async () => {
    const finder = new EventFinderLastNoopAdapter(serialized);

    expect(
      await finder.findLast(mocks.GenericHourHasPassedEvent.stream, [mocks.GenericHourHasPassedEvent.name]),
    ).toEqual(serialized);
  });

  test("findLast - null", async () => {
    const finder = new EventFinderLastNoopAdapter(null);

    expect(
      await finder.findLast(mocks.GenericHourHasPassedEvent.stream, [mocks.GenericHourHasPassedEvent.name]),
    ).toEqual(null);
  });
});
