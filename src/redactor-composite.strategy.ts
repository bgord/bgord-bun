import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorComposite implements RedactorStrategy {
  constructor(private readonly pipeline: ReadonlyArray<RedactorStrategy>) {}

  redact<T>(input: T): T {
    return this.pipeline.reduce((result, redactor) => redactor.redact(result), input);
  }
}
