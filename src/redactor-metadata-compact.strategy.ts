import * as tools from "@bgord/tools";
import { deepCloneWith, isPlainObject } from "./deep-clone-with";
import type { RedactorStrategy } from "./redactor.strategy";

type RedactorWideObjectOptions = { maxKeys?: tools.IntegerPositiveType };

export class RedactorMetadataCompactStrategy implements RedactorStrategy {
  private static readonly DEFAULT_MAX_KEYS = tools.IntegerPositive.parse(20);

  private readonly maxKeys: tools.IntegerPositiveType;

  constructor(options: RedactorWideObjectOptions = {}) {
    this.maxKeys = options.maxKeys ?? RedactorMetadataCompactStrategy.DEFAULT_MAX_KEYS;
  }

  redact<T>(input: T): T {
    return deepCloneWith(
      input,
      (value) => {
        if (!isPlainObject(value) || Array.isArray(value)) return undefined;

        const keys = Object.keys(value).length;

        return keys > this.maxKeys ? { type: "Object", keys } : undefined;
      },
      { allowRootReplace: true },
    );
  }
}
