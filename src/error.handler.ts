import type { ErrorClassifierStrategy } from "./error-classifier.strategy";
import { ErrorClassifierUnknownStrategy } from "./error-classifier-unknown.strategy";
import { ErrorClassifierWithLoggerStrategy } from "./error-classifier-with-logger.strategy";
import type { LoggerPort } from "./logger.port";
import type { HasRequestUrl } from "./request-context.port";

export type ErrorHandlerConfig = ReadonlyArray<ErrorClassifierStrategy>;

export type ErrorHandlerDependencies = { Logger: LoggerPort };

export class ErrorHandler {
  private static readonly unknown = new ErrorClassifierUnknownStrategy();

  private readonly terminal: ErrorClassifierStrategy;

  constructor(
    private readonly config: ErrorHandlerConfig,
    deps: ErrorHandlerDependencies,
  ) {
    this.terminal = new ErrorClassifierWithLoggerStrategy(
      { operation: "unknown_error" },
      { inner: ErrorHandler.unknown, Logger: deps.Logger },
    );
  }

  handle(error: unknown, context: HasRequestUrl): Response {
    for (const classifier of this.config) {
      const response = classifier.classify(error, context);

      if (response) return response;
    }

    // Stryker disable next-line all: the terminal classifier always returns a response
    return this.terminal.classify(error, context) ?? ErrorHandler.unknown.classify(error);
  }
}
