import { HTTPException } from "hono/http-exception";
import type { ErrorClassifierStrategy } from "./error-classifier.strategy";

export type ErrorClassifierHttpExceptionConfig = { errors: ReadonlyArray<string> };

export class ErrorClassifierHttpExceptionHonoStrategy implements ErrorClassifierStrategy {
  constructor(private readonly config: ErrorClassifierHttpExceptionConfig) {}

  classify(error: unknown): Response | null {
    if (!(error instanceof HTTPException)) return null;

    if (!this.config.errors.includes(error.message)) return error.getResponse();

    return Response.json({ message: error.message }, { status: error.status, headers: error.res?.headers });
  }
}
