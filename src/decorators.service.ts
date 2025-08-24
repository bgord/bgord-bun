import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";

export class DecoratorTimeoutError extends Error {}

export class Decorators {
  private readonly rounding = new tools.RoundToDecimal(2);

  constructor(private readonly logger: LoggerPort) {}

  duration() {
    const that = this;

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const className =
        // @ts-expect-error
        this?.constructor?.name || target?.name || target?.constructor?.name || "UnknownClass";

      const original: (...args: unknown[]) => unknown = descriptor.value;

      const label = `${className}.${propertyKey}`;

      descriptor.value = function (...args: unknown[]) {
        const before = performance.now();
        const value = original.apply(this, args);
        const after = performance.now();

        that.logger.info({
          message: `${label} duration`,
          component: "infra",
          operation: "decorators_duration_ms",
          metadata: { durationMs: that.rounding.round(after - before) },
        });

        return value;
      };
    };
  }

  inspector() {
    const that = this;

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const className =
        // @ts-expect-error
        this?.constructor?.name || target?.name || target?.constructor?.name || "UnknownClass";

      const original: (...args: unknown[]) => unknown = descriptor.value;

      const label = `${className}.${propertyKey}`;

      descriptor.value = async function (...args: unknown[]) {
        const value = await original.apply(this, args);

        that.logger.info({
          message: `${label} inspector`,
          component: "infra",
          operation: "decorators_inspector",
          metadata: { arguments: args, output: value },
        });

        return value;
      };
    };
  }

  timeout(ms: number) {
    return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
      const original: (...args: unknown[]) => unknown = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        return await Promise.race([
          original.apply(this, args),
          new Promise((_, reject) => setTimeout(() => reject(new DecoratorTimeoutError()), ms)),
        ]);
      };
    };
  }
}
