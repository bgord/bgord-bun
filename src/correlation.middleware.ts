import * as v from "valibot";
import type { IdProviderPort } from "./id-provider.port";
import type { HasRequestHeader } from "./request-context.port";
import { UUID, type UUIDType } from "./uuid.vo";

type Dependencies = { IdProvider: IdProviderPort };

export class CorrelationMiddleware {
  static readonly HEADER_NAME = "correlation-id";

  constructor(private readonly deps: Dependencies) {}

  evaluate(context: HasRequestHeader): UUIDType {
    const incoming = context.request.header(CorrelationMiddleware.HEADER_NAME);

    const existing = v.safeParse(UUID, incoming);

    if (existing.success) return existing.output;
    return this.deps.IdProvider.generate();
  }
}
