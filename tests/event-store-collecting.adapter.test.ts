import { describe, expect, test } from "bun:test";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { EventValidatorRegistryAdapter } from "../src/event-validator-registry.adapter";
import * as System from "../src/modules/system";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryAdapter<PassageOfTimeEvent>({
  [System.Events.HOUR_HAS_PASSED_EVENT]: System.Events.HourHasPassedEvent,
  [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
});

describe("EventStoreCollectingAdapter", () => {
  test("find", async () => {
    const store = new EventStoreCollectingAdapter<PassageOfTimeEvent>();

    expect(await store.find(registry, "passage_of_time")).toEqual([]);
  });

  test("save", async () => {
    const store = new EventStoreCollectingAdapter<PassageOfTimeEvent>();

    expect(await store.save([mocks.GenericHourHasPassedEvent])).toEqual([mocks.GenericHourHasPassedEvent]);
    expect(await store.save([mocks.GenericMinuteHasPassedEvent])).toEqual([
      mocks.GenericMinuteHasPassedEvent,
    ]);

    expect(store.saved).toEqual([mocks.GenericHourHasPassedEvent, mocks.GenericMinuteHasPassedEvent]);
  });
});
