import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorNoopStrategy implements RedactorStrategy {
  async redact<T>(input: T): Promise<T> {
    return input;
  }
}
