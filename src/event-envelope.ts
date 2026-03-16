import * as z from "zod/v4";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import { EventStream, type EventStreamType } from "./event-stream.vo";
import type { IdProviderPort } from "./id-provider.port";
import { UUID } from "./uuid.vo";

type Dependencies = { IdProvider: IdProviderPort; Clock: ClockPort };

export const EventEnvelopeSchema = {
  id: UUID,
  correlationId: UUID,
  // TODO
  createdAt: z.number(),
  stream: EventStream,
  version: z.literal(1),
  // TODO
  revision: z.number().optional(),
};

export const createEventEnvelope = (stream: EventStreamType, deps: Dependencies) =>
  ({
    id: deps.IdProvider.generate(),
    correlationId: CorrelationStorage.get(),
    createdAt: deps.Clock.now().ms,
    stream,
    version: 1,
  }) as const;
