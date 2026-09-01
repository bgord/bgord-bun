import type { ErrorClassifierStrategy } from "./error-classifier.strategy";
import { ErrorClassifierUnknownStrategy } from "./error-classifier-unknown.strategy";
import { ErrorClassifierWithLoggerStrategy } from "./error-classifier-with-logger.strategy";
import type { LoggerPort } from "./logger.port";
import type { HasRequestUrl } from "./request-context.port";

export type ErrorHandlerConfig = {
  classifiers: ReadonlyArray<ErrorClassifierStrategy>;
  fallback?: ErrorClassifierStrategy;
};

export type ErrorHandlerDependencies = { Logger: LoggerPort };

export class ErrorHandler {
  private static readonly unknown = new ErrorClassifierUnknownStrategy();

  private readonly fallback: ErrorClassifierStrategy;

  constructor(
    private readonly config: ErrorHandlerConfig,
    deps: ErrorHandlerDependencies,
  ) {
    this.fallback =
      config.fallback ??
      new ErrorClassifierWithLoggerStrategy(
        { operation: "unknown_error" },
        { inner: ErrorHandler.unknown, Logger: deps.Logger },
      );
  }

  handle(error: unknown, context: HasRequestUrl): Response {
    for (const classifier of this.config.classifiers) {
      const response = classifier.classify(error, context);

      if (response) return response;
    }

    const fallback = this.fallback.classify(error, context);

    if (fallback) return fallback;

    return ErrorHandler.unknown.classify(error);
  }
}
