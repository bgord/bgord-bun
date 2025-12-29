import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorNoopStrategy implements RedactorStrategy {
  redact<T>(input: T): T {
    return input;
  }
}
