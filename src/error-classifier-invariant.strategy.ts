import type { ErrorClassifierStrategy } from "./error-classifier.strategy";
import type { Invariant } from "./invariant.service";
import { InvariantErrorHandler } from "./invariant-error-handler.service";

export type ErrorClassifierInvariantConfig = ReadonlyArray<Invariant<any>>;

export class ErrorClassifierInvariantStrategy implements ErrorClassifierStrategy {
  constructor(private readonly config: ErrorClassifierInvariantConfig) {}

  classify(error: unknown): Response | null {
    const invariantError = InvariantErrorHandler.detect(this.config, error);

    if (!invariantError) return null;

    const [body, status] = InvariantErrorHandler.respond(invariantError);

    return Response.json({ message: body.message }, { status });
  }
}
