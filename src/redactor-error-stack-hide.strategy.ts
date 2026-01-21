import type { NormalizedError } from "./error-normalizer.service";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorErrorStackHideStrategy implements RedactorStrategy {
  redact<T>(input: T): T {
    if (!this.isNormalizedError(input)) return input;
    return this.hide(input) as T;
  }

  private hide(error: NormalizedError): NormalizedError {
    return {
      message: error.message,
      name: error.name,
      cause: error.cause ? this.hide(error.cause) : undefined,
    };
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
