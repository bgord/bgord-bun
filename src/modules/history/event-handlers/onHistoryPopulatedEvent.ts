import type * as Events from "../events";
import type * as Ports from "../ports";
import * as VO from "../value-objects";

export const onHistoryPopulatedEvent =
  (projection: Ports.HistoryProjectionPort) => async (event: Events.HistoryPopulatedEventType) => {
    const data = VO.HistoryParsed.parse(event.payload);
    await projection.append(data, event.createdAt);
  };
