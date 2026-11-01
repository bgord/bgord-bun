import { describe, expect, spyOn, test } from "bun:test";
import { EventStreamEraserNoopAdapter } from "../src/event-stream-eraser-noop.adapter";
import { EventHandlerBareStrategy } from "../src/handler-bare.strategy";
import { EventBusCollectingAdapter } from "../src/message-bus-collecting.adapter";
import * as Auth from "../src/modules/auth";
import * as mocks from "./mocks";

const EventBus = new EventBusCollectingAdapter<Auth.Events.AccountDeletedEventType>();
const EventHandler = new EventHandlerBareStrategy();
const EventStreamEraser = new EventStreamEraserNoopAdapter();

describe("EventStreamEraser", () => {
  test("happy path", async () => {
    using eventStreamEraserErase = spyOn(EventStreamEraser, "erase");
    const policy = new Auth.Policies.EventStreamEraser({
      EventBus,
      EventHandler,
      EventStreamEraser,
    });

    await policy.onAccountDeletedEvent(mocks.GenericAccountDeletedEvent);

    expect(eventStreamEraserErase).toHaveBeenCalledWith(mocks.userId);
  });
});
