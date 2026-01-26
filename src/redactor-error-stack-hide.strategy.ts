import { ErrorNormalizer, type NormalizedError } from "./error-normalizer.service";
import { isPlainObject } from "./is-plain-object";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorErrorStackHide implements RedactorStrategy {
  redact<T>(input: T): T {
    // Stryker disable all
    if (!isPlainObject(input)) return input;
    // Stryker restore all
    if (!ErrorNormalizer.isNormalizedError(input.error)) return input;

    return { ...input, error: this.hide(input.error) };
  }

  private hide(error: NormalizedError): NormalizedError {
    return {
      ...error,
      stack: undefined,
      cause: error.cause ? this.hide(error.cause) : undefined,
    };
  }
}
