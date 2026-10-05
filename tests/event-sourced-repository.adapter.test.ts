import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { EventSourcedRepositoryAdapter } from "../src/event-sourced-repository.adapter";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import type * as System from "../src/modules/system";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("EventSourcedRepositoryAdapter", () => {
  test("load", async () => {
    const EventStore = new EventStoreCollectingAdapter<System.Events.HourHasPassedEventType>();
    using find = spyOn(EventStore, "find").mockResolvedValue([mocks.GenericHourHasPassedEvent]);
    const repository = new EventSourcedRepositoryAdapter(
      { aggregate: mocks.SampleAggregate },
      { Clock, EventStore },
    );

    const aggregate = await repository.load(mocks.userId);

    expect(find).toHaveBeenCalledWith(
      mocks.SampleAggregate.registry,
      mocks.SampleAggregate.getStream(mocks.userId),
    );
    expect(aggregate.id).toEqual(mocks.userId);
    expect(aggregate.history).toEqual([mocks.GenericHourHasPassedEvent]);
    expect(aggregate.deps).toEqual({ Clock, EventStore });
  });

  test("load - no history", async () => {
    const EventStore = new EventStoreCollectingAdapter<System.Events.HourHasPassedEventType>();
    const repository = new EventSourcedRepositoryAdapter(
      { aggregate: mocks.SampleAggregate },
      { Clock, EventStore },
    );

    expect(async () => repository.load(mocks.userId)).toThrow("sample.aggregate.missing");
  });

  test("save", async () => {
    const EventStore = new EventStoreCollectingAdapter<System.Events.HourHasPassedEventType>();
    const repository = new EventSourcedRepositoryAdapter(
      { aggregate: mocks.SampleAggregate },
      { Clock, EventStore },
    );
    const aggregate = mocks.SampleAggregate.build(mocks.userId, [mocks.GenericHourHasPassedEvent], { Clock });
    aggregate.record(mocks.GenericHourHasPassedEvent);

    await repository.save(aggregate);

    expect(EventStore.saved).toEqual([mocks.GenericHourHasPassedEvent]);
    expect(aggregate.pullEvents()).toEqual([]);
  });

  test("save - no pending events", async () => {
    const EventStore = new EventStoreCollectingAdapter<System.Events.HourHasPassedEventType>();
    const repository = new EventSourcedRepositoryAdapter(
      { aggregate: mocks.SampleAggregate },
      { Clock, EventStore },
    );
    const aggregate = mocks.SampleAggregate.build(mocks.userId, [mocks.GenericHourHasPassedEvent], { Clock });

    await repository.save(aggregate);

    expect(EventStore.saved).toEqual([]);
  });
});
