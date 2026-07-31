import * as v from "valibot";
import { CorrelationId, type CorrelationIdType } from "./correlation-id.vo";
import type { IdProviderPort } from "./id-provider.port";
import type { HasRequestHeader } from "./request-context.port";

export type CorrelationMiddlewareDependencies = { IdProvider: IdProviderPort };

export class CorrelationMiddleware {
  static readonly HEADER_NAME = "correlation-id";

  constructor(private readonly deps: CorrelationMiddlewareDependencies) {}

  evaluate(context: HasRequestHeader): CorrelationIdType {
    const incoming = context.request.header(CorrelationMiddleware.HEADER_NAME);

    const existing = v.safeParse(CorrelationId, incoming);

    if (existing.success) return existing.output;
    return this.deps.IdProvider.generate();
  }
}
