import cloneDeepWith from "lodash/cloneDeepWith";
import type { RedactorPort } from "./redactor.port";

export class RedactorMaskAdapter implements RedactorPort {
  // TODO static INITIAL_KEYS

  private readonly keys: Set<string>;

  constructor(keys: readonly string[]) {
    this.keys = new Set(keys.map((key) => key.toLowerCase()));
  }

  redact<T>(input: T): T {
    return cloneDeepWith(input, (_value, key) => {
      if (typeof key === "string" && this.keys.has(key.toLowerCase())) return "***";
      return undefined;
    });
  }
}
