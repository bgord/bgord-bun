import * as tools from "@bgord/tools";
import { CorrelationStorage } from "./correlation-storage.service";
import { UUID } from "./uuid.vo";

export const CommandEnvelopeSchema = {
  id: UUID,
  correlationId: UUID,
  createdAt: tools.Timestamp,
};

export const createCommandEnvelope = () =>
  ({
    id: crypto.randomUUID(),
    correlationId: CorrelationStorage.get(),
    createdAt: tools.Time.Now().value,
  }) as const;
