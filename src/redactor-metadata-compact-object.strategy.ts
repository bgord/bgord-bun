import * as tools from "@bgord/tools";
import { deepCloneWith } from "./deep-clone-with";
import { isPlainObject } from "./is-plain-object";
import type { RedactorStrategy } from "./redactor.strategy";

type RedactorMetadataCompactObjectOptions = { maxKeys?: tools.IntegerPositiveType };

export class RedactorMetadataCompactObjectStrategy implements RedactorStrategy {
  private static readonly DEFAULT_MAX_KEYS = tools.IntegerPositive.parse(20);

  private readonly maxKeys: tools.IntegerPositiveType;

  constructor(options: RedactorMetadataCompactObjectOptions = {}) {
    this.maxKeys = options.maxKeys ?? RedactorMetadataCompactObjectStrategy.DEFAULT_MAX_KEYS;
  }

  redact<T>(input: T): T {
    if (!isPlainObject(input)) return input;

    return {
      ...input,
      metadata: deepCloneWith(
        input.metadata,
        (value) => {
          if (!isPlainObject(value) || Array.isArray(value)) return undefined;

          const keys = Object.keys(value).length;

          return keys > this.maxKeys ? { type: "Object", keys } : undefined;
        },
        { allowRootReplace: true },
      ),
    };
  }
}
