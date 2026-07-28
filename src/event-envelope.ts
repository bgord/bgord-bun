import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { BuildInfoType } from "./build-info.vo";
import type { ClockPort } from "./clock.port";
import { CommitShaValue } from "./commit-sha-value.vo";
import { CorrelationStorage } from "./correlation-storage.service";
import { EventStream, type EventStreamType } from "./event-stream.vo";
import type { IdProviderPort } from "./id-provider.port";
import type { ReactiveConfigPort } from "./reactive-config.port";
import { UUID } from "./uuid.vo";

type Dependencies = {
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  BuildInfoConfig: ReactiveConfigPort<BuildInfoType>;
};

export const EventEnvelopeSchema = {
  id: UUID,
  correlationId: UUID,
  createdAt: tools.TimestampValue,
  stream: EventStream,
  version: v.literal(1),
  revision: v.optional(tools.RevisionValue),
  commit: CommitShaValue,
};

const createEventEnvelope = async (stream: EventStreamType, deps: Dependencies) =>
  ({
    id: deps.IdProvider.generate(),
    correlationId: CorrelationStorage.get(),
    createdAt: deps.Clock.now().ms,
    stream,
    commit: (await deps.BuildInfoConfig.get()).sha,
  }) as const;

export async function event<Schema extends v.ObjectSchema<any, any>>(
  schema: Schema,
  stream: EventStreamType,
  payload: v.InferOutput<Schema>["payload"],
  deps: Dependencies,
): Promise<v.InferOutput<Schema>> {
  return v.parse(schema, {
    ...(await createEventEnvelope(stream, deps)),
    name: schema.entries.name.literal,
    version: schema.entries.version.literal,
    payload,
  });
}
