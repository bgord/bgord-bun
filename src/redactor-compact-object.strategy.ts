import * as tools from "@bgord/tools";
import _ from "lodash";
import type { RedactorStrategy } from "./redactor.strategy";

type RedactorWideObjectOptions = { maxKeys?: tools.IntegerPositiveType };

export class RedactorCompactObjectStrategy implements RedactorStrategy {
  private static readonly DEFAULT_MAX_KEYS = tools.IntegerPositive.parse(20);

  private readonly maxKeys: tools.IntegerPositiveType;

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
