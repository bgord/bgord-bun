import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorNoop implements RedactorStrategy {
  redact<T>(input: T): T {
    return input;
  }
}
