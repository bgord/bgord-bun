import { describe, expect, spyOn, test } from "bun:test";
import * as History from "../src/modules/history";
import * as mocks from "./mocks";

class HistoryProjection implements History.Ports.HistoryProjectionPort {
  async append(_data: History.VO.HistoryParsedType): Promise<void> {}

  async clear(_subject: History.VO.HistoryParsedType["subject"]): Promise<void> {}
}

describe("History.EventHandlers.onHistoryClearedEvent", () => {
  test("happy path", async () => {
    const projection = new HistoryProjection();
    const handler = History.EventHandlers.onHistoryClearedEvent(projection);
    const event = History.Events.HistoryClearedEvent.parse({
      id: mocks.correlationId,
      correlationId: mocks.correlationId,
      name: "HISTORY_CLEARED_EVENT",
      payload: { subject: "order" },
      createdAt: mocks.TIME_ZERO.ms,
      stream: "history_order",
      version: 1,
    });
    using projectionClear = spyOn(projection, "clear");

    await handler(event);

    expect(projectionClear).toHaveBeenCalledWith("order");
  });
});
