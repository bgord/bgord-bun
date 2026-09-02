import { HTTPException } from "hono/http-exception";
import type { ErrorClassifierStrategy } from "./error-classifier.strategy";

export type ErrorClassifierHttpExceptionConfig = ReadonlyArray<string | Record<string, string>>;

export class ErrorClassifierHttpExceptionHonoStrategy implements ErrorClassifierStrategy {
  private readonly errors: ReadonlySet<string>;

  constructor(config: ErrorClassifierHttpExceptionConfig) {
    this.errors = new Set(
      config.flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry))),
    );
  }

  classify(error: unknown): Response | null {
    if (!(error instanceof HTTPException)) return null;

    if (!this.errors.has(error.message)) {
      return Response.json(
        { message: "general.unknown" },
        { status: error.status, headers: error.res?.headers },
      );
    }

    return Response.json({ message: error.message }, { status: error.status, headers: error.res?.headers });
  }
}
