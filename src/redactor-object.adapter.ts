import _ from "lodash";
import type { RedactorPort } from "./redactor.port";

type RedactorWideObjectOptions = { maxKeys?: number };

export class RedactorObjectAdapter implements RedactorPort {
  private static readonly DEFAULT_MAX_KEYS = 20;

  private readonly maxKeys: number;

  constructor(options: RedactorWideObjectOptions = {}) {
    this.maxKeys = options.maxKeys ?? RedactorObjectAdapter.DEFAULT_MAX_KEYS;
  }

  redact<T>(input: T): T {
    return _.cloneDeepWith(input, (value) => {
      if (!_.isPlainObject(value)) return undefined;

      const keys = Object.keys(value).length;

      return keys <= this.maxKeys ? undefined : { type: "Object", keys };
    });
  }
}
