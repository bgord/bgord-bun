import * as tools from "@bgord/tools";
import { z } from "zod/v4";
import { CorrelationStorage } from "./correlation-storage.service";
import type { EventStreamType } from "./event-stream.vo";
import type { IdProviderPort } from "./id-provider.port";
import { UUID } from "./uuid.vo";

export const EventEnvelopeSchema = {
  id: UUID,
  correlationId: UUID,
  createdAt: tools.Timestamp,
  stream: z.string().min(1),
  version: z.literal(1),
  revision: tools.RevisionValue.optional(),
};

export const createEventEnvelope = (IdProvider: IdProviderPort, stream: EventStreamType) =>
  ({
    id: IdProvider.generate(),
    correlationId: CorrelationStorage.get(),
    createdAt: tools.Time.Now().value,
    stream,
    version: 1,
  }) as const;
