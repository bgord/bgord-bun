import { deepCloneWith } from "./deep-clone-with";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorMetadataCompactArrayStrategy implements RedactorStrategy {
  redact<T>(input: T): T {
    return deepCloneWith(
      input,
      (value) => (Array.isArray(value) ? { type: "Array", length: value.length } : undefined),
      { allowRootReplace: true },
    );
  }
}
