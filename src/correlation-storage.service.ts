import { AsyncLocalStorage } from "node:async_hooks";
import { createMiddleware } from "hono/factory";
import type { CorrelationIdType } from "./correlation-id.vo";

type CorrelationContext = { correlationId: CorrelationIdType };

export const CorrelationStorageError = { Missing: "correlation.storage.missing" } as const;

export class CorrelationStorage {
  private static readonly GLOBAL_KEY = Symbol.for("bgord.CorrelationStorage");

  // biome-ignore lint: lint/suspicious/noAssignInExpressions
  private static readonly als: AsyncLocalStorage<CorrelationContext> = ((globalThis as any)[
    this.GLOBAL_KEY
  ] ??=
    new AsyncLocalStorage<CorrelationContext>());

  static run<T>(correlationId: CorrelationIdType, fn: () => T | Promise<T>): T | Promise<T> {
    return CorrelationStorage.als.run({ correlationId }, fn);
  }

  static get(): CorrelationIdType {
    const store = CorrelationStorage.als.getStore();

    if (!store) throw new Error(CorrelationStorageError.Missing);
    return store.correlationId;
  }

  static handle = () => createMiddleware(async (c, next) => CorrelationStorage.run(c.get("requestId"), next));
}
