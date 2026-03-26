import * as tools from "@bgord/tools";
import type { RedactorStrategy } from "./redactor.strategy";

type RedactorMetadataCompactObjectOptions = { maxKeys?: tools.IntegerPositiveType };

export class RedactorMetadataCompactObject implements RedactorStrategy {
  private static readonly DEFAULT_MAX_KEYS = tools.Int.positive(20);

  private readonly maxKeys: tools.IntegerPositiveType;

  constructor(options: RedactorMetadataCompactObjectOptions = {}) {
    this.maxKeys = options.maxKeys ?? RedactorMetadataCompactObject.DEFAULT_MAX_KEYS;
  }

  redact<T>(input: T): T {
    if (!tools.isPlainObject(input)) return input;

    return {
      ...input,
      metadata: tools.deepCloneWith(
        input["metadata"],
        (value) => {
          if (!tools.isPlainObject(value) || Array.isArray(value)) return undefined;

          const keys = Object.keys(value).length;

          return keys > this.maxKeys ? { type: "Object", keys } : undefined;
        },
        { allowRootReplace: true },
      ),
    };
  }
}
