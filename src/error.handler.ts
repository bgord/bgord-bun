import type { ErrorClassifierStrategy } from "./error-classifier.strategy";
import { ErrorClassifierUnknownStrategy } from "./error-classifier-unknown.strategy";
import type { HasRequestUrl } from "./request-context.port";

export type ErrorHandlerConfig = { classifiers: ReadonlyArray<ErrorClassifierStrategy> };

export class ErrorHandler {
  private static readonly fallback = new ErrorClassifierUnknownStrategy();

  constructor(private readonly config: ErrorHandlerConfig) {}

  handle(error: unknown, context: HasRequestUrl): Response {
    for (const classifier of this.config.classifiers) {
      const response = classifier.classify(error, context);

      if (response) return response;
    }

    return ErrorHandler.fallback.classify(error);
  }
}
