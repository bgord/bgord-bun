import * as tools from "@bgord/tools";
import type { RedactorStrategy } from "./redactor.strategy";

type RedactorMetadataCompactArrayOptions = { maxItems?: tools.IntegerPositiveType };

export class RedactorMetadataCompactArray implements RedactorStrategy {
  private static readonly DEFAULT_MAX_ITEMS = tools.Int.positive(20);

  private readonly maxItems: tools.IntegerPositiveType;

  constructor(options: RedactorMetadataCompactArrayOptions = {}) {
    this.maxItems = options.maxItems ?? RedactorMetadataCompactArray.DEFAULT_MAX_ITEMS;
  }

  redact<T>(input: T): T {
    if (!tools.isPlainObject(input)) return input;

    return {
      ...input,
      metadata: tools.deepCloneWith(
        input["metadata"],
        (value) => {
          if (!Array.isArray(value)) return undefined;
          if (value.length <= this.maxItems) return undefined;
          return { type: "Array", length: value.length };
        },
        { allowRootReplace: true },
      ),
    };
  }
}
