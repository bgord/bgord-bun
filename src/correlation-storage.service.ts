import { AsyncLocalStorage } from "node:async_hooks";
import { createMiddleware } from "hono/factory";

import type { CorrelationIdType } from "./correlation-id.vo";

interface CorrelationContext {
  correlationId: CorrelationIdType;
}

export class CorrelationStorage {
  private static readonly GLOBAL_KEY = Symbol.for("bgord.CorrelationStorage");

  private static readonly als: AsyncLocalStorage<CorrelationContext> = ((globalThis as any)[
    this.GLOBAL_KEY
  ] ??=
    new AsyncLocalStorage<CorrelationContext>());

  static run<T>(correlationId: CorrelationIdType, fn: () => T | Promise<T>): T | Promise<T> {
    return CorrelationStorage.als.run({ correlationId }, fn);
  }

  static get(): CorrelationIdType {
    const store = CorrelationStorage.als.getStore();
    if (!store) throw new Error("CorrelationId missing from context");
    return store.correlationId;
  }

  static handle = () =>
    createMiddleware(async (c, next) => {
      const correlationId = c.get("requestId");

      return CorrelationStorage.run(correlationId, next);
    });
}
