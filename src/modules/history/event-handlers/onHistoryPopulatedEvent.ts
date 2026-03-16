import * as v from "valibot";
import type * as Events from "../events";
import type * as Ports from "../ports";
import * as VO from "../value-objects";

export const onHistoryPopulatedEvent =
  (projection: Ports.HistoryProjectionPort) => async (event: Events.HistoryPopulatedEventType) => {
    const data = v.parse(VO.HistoryParsed, { ...event.payload, createdAt: event.createdAt });

    await projection.append(data);
  };
