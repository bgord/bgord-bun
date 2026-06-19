import type * as Events from "../events";
import type * as Ports from "../ports";

export const onHistoryClearedEvent =
  (projection: Ports.HistoryProjectionPort) => async (event: Events.HistoryClearedEventType) =>
    await projection.clear(event.payload.subject);
