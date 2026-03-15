import { describe, expect, test } from "bun:test";
import { EventStoreNoopAdapter } from "../src/event-store-noop.adapter";
import { EventValidatorRegistryZodAdapter } from "../src/event-validator-registry-zod.adapter";
import * as System from "../src/modules/system";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryZodAdapter<PassageOfTimeEvent>([
  System.Events.HourHasPassedEvent,
  System.Events.MinuteHasPassedEvent,
]);

const store = new EventStoreNoopAdapter<PassageOfTimeEvent>();

describe("EventStoreNoopAdapter", () => {
  test("find", async () => {
    expect(await store.find(registry, "passage_of_time")).toEqual([]);
  });

  test("save", async () => {
    expect(await store.save([mocks.GenericHourHasPassedEvent])).toEqual([]);
  });
});
