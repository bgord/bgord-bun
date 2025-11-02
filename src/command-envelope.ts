import * as tools from "@bgord/tools";
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
    createdAt: deps.Clock.nowMs(),
  }) as const;
