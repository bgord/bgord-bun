import { CorrelationStorage } from "./correlation-storage.service";
import type { ErrorClassifierStrategy } from "./error-classifier.strategy";
import type { LoggerPort } from "./logger.port";
import type { HasRequestUrl } from "./request-context.port";

export type ErrorClassifierWithLoggerStrategyConfig = { operation: string };

export type ErrorClassifierWithLoggerStrategyDependencies = {
  inner: ErrorClassifierStrategy;
  Logger: LoggerPort;
};

export class ErrorClassifierWithLoggerStrategy implements ErrorClassifierStrategy {
  constructor(
    private readonly config: ErrorClassifierWithLoggerStrategyConfig,
    private readonly deps: ErrorClassifierWithLoggerStrategyDependencies,
  ) {}

  classify(error: unknown, context: HasRequestUrl): Response | null {
    const response = this.deps.inner.classify(error, context);

    if (!response) return null;

    this.deps.Logger.error({
      message: "Classified error",
      component: "http",
      operation: this.config.operation,
      correlationId: CorrelationStorage.get(),
      metadata: { url: context.request.url(), status: response.status },
      error,
    });

    return response;
  }
}
