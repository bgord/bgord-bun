import { describe, expect, test } from "bun:test";
import { EventInserterNoopAdapter } from "../src/event-inserter-noop.adapter";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

const serializer = new PayloadSerializerJsonAdapter();
const inserter = new EventInserterNoopAdapter();

const serialized = {
  ...mocks.GenericHourHasPassedEvent,
  payload: serializer.serialize(mocks.GenericHourHasPassedEvent.payload),
};

describe("EventInserterNoopAdapter", () => {
  test("insert", async () => {
    expect(await inserter.insert([serialized])).toEqual([serialized]);
  });
});
