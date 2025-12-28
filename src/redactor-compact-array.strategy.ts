import cloneDeepWith from "lodash/cloneDeepWith";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorCompactArrayStrategy implements RedactorStrategy {
  async redact<T>(input: T): Promise<T> {
    return cloneDeepWith(input, (value) =>
      Array.isArray(value) ? { type: "Array", length: value.length } : undefined,
    );
  }
}
