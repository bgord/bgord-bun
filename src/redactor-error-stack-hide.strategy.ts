import { ErrorNormalizer, type NormalizedError } from "./error-normalizer.service";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorErrorStackHideStrategy implements RedactorStrategy {
  redact<T>(input: T): T {
    if (!ErrorNormalizer.isNormalizedError(input)) return input;
    return this.hide(input) as T;
  }

  private hide(error: NormalizedError): NormalizedError {
    return {
      ...error,
      stack: undefined,
      cause: error.cause ? this.hide(error.cause) : undefined,
    };
  }
}
