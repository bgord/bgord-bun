import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import { EventStream, type EventStreamType } from "./event-stream.vo";
import type { IdProviderPort } from "./id-provider.port";
import { UUID } from "./uuid.vo";

type Dependencies = { IdProvider: IdProviderPort; Clock: ClockPort };

export const EventEnvelopeSchema = {
  id: UUID,
  correlationId: UUID,
  createdAt: tools.TimestampValue,
  stream: EventStream,
  version: v.literal(1),
  revision: v.optional(tools.RevisionValue),
};

export const createEventEnvelope = (stream: EventStreamType, deps: Dependencies) =>
  ({
    id: deps.IdProvider.generate(),
    correlationId: CorrelationStorage.get(),
    createdAt: deps.Clock.now().ms,
    stream,
    version: 1,
  }) as const;

export function event<Schema extends v.ObjectSchema<any, any>>(
  schema: Schema,
  stream: EventStreamType,
  payload: v.InferOutput<Schema>["payload"],
  deps: Dependencies,
): v.InferOutput<Schema> {
  return v.parse(schema, {
    ...createEventEnvelope(stream, deps),
    name: schema.entries.name.literal,
    payload,
  });
}
