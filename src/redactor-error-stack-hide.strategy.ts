import { isPlainObject } from "./deep-clone-with";
import { ErrorNormalizer, type NormalizedError } from "./error-normalizer.service";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorErrorStackHideStrategy implements RedactorStrategy {
  redact<T>(input: T): T {
    if (!isPlainObject(input)) return input;
    if (!("error" in input)) return input;
    if (!ErrorNormalizer.isNormalizedError(input.error)) return input;

    return { ...input, error: this.hide(input.error) } as T;
  }

  private hide(error: NormalizedError): NormalizedError {
    return {
      ...error,
      stack: undefined,
      cause: error.cause ? this.hide(error.cause) : undefined,
    };
  }
}
