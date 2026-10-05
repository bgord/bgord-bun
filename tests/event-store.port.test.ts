import { describe, expect, test } from "bun:test";
import type { EventStorePort } from "../src/event-store.port";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import type * as System from "../src/modules/system";

type HourHasPassed = System.Events.HourHasPassedEventType;
type MinuteHasPassed = System.Events.MinuteHasPassedEventType;

describe("EventStorePort", () => {
  test("variance - narrower event union", () => {
    const EventStore: EventStorePort<HourHasPassed | MinuteHasPassed> = new EventStoreCollectingAdapter<
      HourHasPassed | MinuteHasPassed
    >();

    const narrowed: EventStorePort<HourHasPassed> = EventStore;

    expect<unknown>(narrowed).toBe(EventStore);
  });

  test("variance - event outside union", () => {
    const EventStore: EventStorePort<HourHasPassed> = new EventStoreCollectingAdapter<HourHasPassed>();

    // @ts-expect-error MinuteHasPassed is not in the store's union
    const widened: EventStorePort<HourHasPassed | MinuteHasPassed> = EventStore;

    expect<unknown>(widened).toBe(EventStore);
  });

  test("variance - adapter - event outside union", () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassed>();

    // @ts-expect-error MinuteHasPassed is not in the store's union
    const widened: EventStorePort<HourHasPassed | MinuteHasPassed> = EventStore;

    expect<unknown>(widened).toBe(EventStore);
  });
});
