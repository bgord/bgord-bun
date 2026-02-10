import { describe, expect, spyOn, test } from "bun:test";
import * as History from "../src/modules/history";
import * as mocks from "./mocks";

class HistoryProjection implements History.Ports.HistoryProjectionPort {
  async append(_data: History.VO.HistoryParsedType): Promise<void> {}

  async clear(_subject: History.VO.HistoryParsedType["subject"]): Promise<void> {}
}

describe("History.EventHandlers.onHistoryPopulatedEvent", () => {
  test("happy path", async () => {
    const projection = new HistoryProjection();
    const handler = History.EventHandlers.onHistoryPopulatedEvent(projection);
    using projectionAppend = spyOn(projection, "append");
    const event = History.Events.HistoryPopulatedEvent.parse({
      id: mocks.correlationId,
      correlationId: mocks.correlationId,
      name: "HISTORY_POPULATED_EVENT",
      payload: {
        id: mocks.correlationId,
        operation: "add",
        subject: "order",
        payload: { id: mocks.correlationId },
      },
      createdAt: mocks.TIME_ZERO.ms,
      stream: "history_order",
      version: 1,
    });

    await handler(event);

    expect(projectionAppend).toHaveBeenCalledWith({
      createdAt: event.createdAt,
      id: event.id,
      operation: event.payload.operation,
      payload: JSON.stringify(event.payload.payload),
      subject: event.payload.subject,
    });
  });
});
