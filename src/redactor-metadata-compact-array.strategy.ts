import { deepCloneWith, isPlainObject } from "./deep-clone-with";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorMetadataCompactArrayStrategy implements RedactorStrategy {
  redact<T>(input: T): T {
    if (!isPlainObject(input)) return input;
    if (!("metadata" in input)) return input;

    return {
      ...input,
      metadata: deepCloneWith(
        input.metadata,
        (value) => (Array.isArray(value) ? { type: "Array", length: value.length } : undefined),
        { allowRootReplace: true },
      ),
    };
  }
}
