import { HTTPException } from "hono/http-exception";
import type { ErrorClassifierStrategy } from "./error-classifier.strategy";

export type ErrorClassifierHttpExceptionConfig = { known: ReadonlyArray<string> };

export class ErrorClassifierHttpExceptionHonoStrategy implements ErrorClassifierStrategy {
  constructor(private readonly config: ErrorClassifierHttpExceptionConfig) {}

  classify(error: unknown): Response | null {
    if (!(error instanceof HTTPException)) return null;

    if (!this.config.known.includes(error.message)) return error.getResponse();

    return Response.json({ message: error.message, _known: true }, { status: error.status });
  }
}
