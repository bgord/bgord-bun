import _ from "lodash";
import type { RedactorStrategy } from "./redactor.strategy";

type RedactorWideObjectOptions = { maxKeys?: number };

export class RedactorCompactObjectStrategy implements RedactorStrategy {
  private static readonly DEFAULT_MAX_KEYS = 20;

  private readonly maxKeys: number;

  constructor(options: RedactorWideObjectOptions = {}) {
    this.maxKeys = options.maxKeys ?? RedactorCompactObjectStrategy.DEFAULT_MAX_KEYS;
  }

  redact<T>(input: T): T {
    return _.cloneDeepWith(input, (value) => {
      if (!_.isPlainObject(value)) return undefined;

      const keys = Object.keys(value).length;

      return keys <= this.maxKeys ? undefined : { type: "Object", keys };
    });
  }
}
