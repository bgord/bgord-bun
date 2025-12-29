import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorCompositeStrategy implements RedactorStrategy {
  constructor(private readonly pipeline: readonly RedactorStrategy[]) {}

  redact<T>(input: T): T {
    return this.pipeline.reduce((result, redactor) => redactor.redact(result), input);
  }
}
