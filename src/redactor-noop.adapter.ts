import type { RedactorPort } from "./redactor.port";

export class RedactorNoopAdapter implements RedactorPort {
  redact<T>(input: T): T {
    return input;
  }
}
