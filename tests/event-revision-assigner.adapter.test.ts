import { describe, expect, test } from "bun:test";
import { EventRevisionAssignerAdapter } from "../src/event-revision-assigner.adapter";
import type * as System from "../src/modules/system";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const assigner = new EventRevisionAssignerAdapter();
const serializer = new PayloadSerializerJsonAdapter();

const serialized = (event: PassageOfTimeEvent) => ({
  ...event,
  payload: serializer.serialize(event.payload),
});

const event = serialized(mocks.GenericHourHasPassedEvent);
const another = serialized(mocks.GenericMinuteHasPassedEvent);

describe("EventRevisionAssignerAdapter", () => {
  test("empty stream", () => {
    expect(assigner.assign([event])[0]?.revision).toEqual(0);
  });

  test("empty stream - multiple events", () => {
    const result = assigner.assign([event, another]);

    expect(result[0]?.revision).toEqual(0);
    expect(result[1]?.revision).toEqual(1);
  });

  test("non-empty stream - one event", () => {
    const result = assigner.assign([event], 2);

    expect(result[0]?.revision).toEqual(3);
  });

  test("non-empty stream - multiple events", () => {
    const result = assigner.assign([event, another], 2);

    expect(result[0]?.revision).toEqual(3);
    expect(result[1]?.revision).toEqual(4);
  });

  test("no events", () => {
    expect(assigner.assign([])).toEqual([]);
  });
});
