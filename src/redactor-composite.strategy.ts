import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorCompositeStrategy implements RedactorStrategy {
  constructor(private readonly pipeline: readonly RedactorStrategy[]) {}

  async redact<T>(input: T): Promise<T> {
    let result = input;

    for (const redactor of this.pipeline) {
      result = await redactor.redact(result);
    }

    return result;
  }
}
