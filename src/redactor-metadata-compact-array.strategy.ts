import * as tools from "@bgord/tools";
import { deepCloneWith, isPlainObject } from "./deep-clone-with";
import type { RedactorStrategy } from "./redactor.strategy";

type RedactorMetadataCompactArrayOptions = { maxItems?: tools.IntegerPositiveType };

export class RedactorMetadataCompactArrayStrategy implements RedactorStrategy {
  private static readonly DEFAULT_MAX_ITEMS = tools.IntegerPositive.parse(20);

  private readonly maxItems: tools.IntegerPositiveType;

  constructor(options: RedactorMetadataCompactArrayOptions = {}) {
    this.maxItems = options.maxItems ?? RedactorMetadataCompactArrayStrategy.DEFAULT_MAX_ITEMS;
  }

  redact<T>(input: T): T {
    if (!isPlainObject(input)) return input;
    if (!("metadata" in input)) return input;

    return {
      ...input,
      metadata: deepCloneWith(
        input.metadata,
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
