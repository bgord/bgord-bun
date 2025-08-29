import * as tools from "@bgord/tools";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import { UUID } from "./uuid.vo";

export const CommandEnvelopeSchema = {
  id: UUID,
  correlationId: UUID,
  createdAt: tools.Timestamp,
};

export const createCommandEnvelope = (IdProvider: IdProviderPort) =>
  ({
    id: IdProvider.generate(),
    correlationId: CorrelationStorage.get(),
    createdAt: tools.Time.Now().value,
  }) as const;
