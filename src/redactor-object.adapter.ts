import _ from "lodash";
import type { RedactorPort } from "./redactor.port";

type RedactorWideObjectOptions = { maxKeys?: number };

export class RedactorObjectAdapter implements RedactorPort {
  private readonly maxKeys: number;

  constructor(options: RedactorWideObjectOptions = {}) {
    this.maxKeys = options.maxKeys ?? 10;
  }

  redact<T>(input: T): T {
    return _.cloneDeepWith(input, (value) => {
      if (!_.isPlainObject(value)) return undefined;

      const keys = Object.keys(value).length;

      return keys <= this.maxKeys ? undefined : { type: "Object", keys };
    });
  }
}
