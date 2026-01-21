import { isPlainObject } from "./deep-clone-with";
import { ErrorNormalizer, type NormalizedError } from "./error-normalizer.service";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorErrorCauseDepthLimitStrategy implements RedactorStrategy {
  constructor(private readonly max: number) {}

  redact<T>(input: T): T {
    if (!isPlainObject(input)) return input;
    if (!("error" in input)) return input;
    if (!ErrorNormalizer.isNormalizedError(input.error)) return input;

    return { ...input, error: this.limit(input.error, 0) } as T;
  }

  private limit(error: NormalizedError, depth: number): NormalizedError {
    if (!error.cause || depth >= this.max) return { ...error, cause: undefined };
    return { ...error, cause: this.limit(error.cause, depth + 1) };
  }
}
