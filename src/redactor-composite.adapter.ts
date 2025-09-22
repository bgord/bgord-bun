import type { RedactorPort } from "./redactor.port";

export class RedactorCompositeAdapter implements RedactorPort {
  constructor(private readonly pipeline: readonly RedactorPort[]) {}

  redact<T>(input: T): T {
    return this.pipeline.reduce((result, redactor) => redactor.redact(result), input);
  }
}
