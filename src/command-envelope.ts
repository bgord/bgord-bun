import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import { UUID } from "./uuid.vo";

type Dependencies = { IdProvider: IdProviderPort; Clock: ClockPort };

export const CommandEnvelopeSchema = { id: UUID, correlationId: UUID, createdAt: tools.TimestampValue };

export const createCommandEnvelope = (deps: Dependencies) =>
  ({
    id: deps.IdProvider.generate(),
    correlationId: CorrelationStorage.get(),
    createdAt: deps.Clock.now().ms,
  }) as const;

export function command<Schema extends v.ObjectSchema<any, any>>(
  schema: Schema,
  fields: Omit<v.InferOutput<Schema>, "id" | "correlationId" | "createdAt" | "name">,
  deps: Dependencies,
): v.InferOutput<Schema> {
  return v.parse(schema, { ...createCommandEnvelope(deps), name: schema.entries.name.literal, ...fields });
}
