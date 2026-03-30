import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import { UUID } from "./uuid.vo";

type Dependencies = { IdProvider: IdProviderPort; Clock: ClockPort };

export const JobEnvelopeSchema = {
  id: UUID,
  correlationId: UUID,
  createdAt: tools.TimestampValue,
  revision: tools.RevisionValue,
};

const createJobEnvelope = (deps: Dependencies) =>
  ({
    id: deps.IdProvider.generate(),
    correlationId: CorrelationStorage.get(),
    createdAt: deps.Clock.now().ms,
    revision: 0,
  }) as const;

export function job<Schema extends v.ObjectSchema<any, any>>(
  schema: Schema,
  payload: v.InferOutput<Schema>["payload"],
  deps: Dependencies,
): v.InferOutput<Schema> {
  return v.parse(schema, { ...createJobEnvelope(deps), name: schema.entries.name.literal, payload });
}
