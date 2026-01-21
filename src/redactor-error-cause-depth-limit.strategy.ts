import type { NormalizedError } from "./error-normalizer.service";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorErrorCauseDepthLimitStrategy implements RedactorStrategy {
  constructor(private readonly max: number) {}

  redact<T>(input: T): T {
    if (!this.isNormalizedError(input)) return input;
    return this.limit(input, 0) as T;
  }

  private limit(error: NormalizedError, depth: number): NormalizedError {
    if (!error.cause || depth >= this.max) return { ...error, cause: undefined };
    return { ...error, cause: this.limit(error.cause, depth + 1) };
  }

  private isNormalizedError(value: unknown): value is NormalizedError {
    return (
      typeof value === "object" &&
      value !== null &&
      "message" in value &&
      typeof (value as any).message === "string"
    );
  }
}
