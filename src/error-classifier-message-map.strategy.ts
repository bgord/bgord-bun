import type { ErrorClassifierStrategy } from "./error-classifier.strategy";

export type ErrorClassifierMessageMapConfig = Record<string, { message: string; status: number }>;

export class ErrorClassifierMessageMapStrategy implements ErrorClassifierStrategy {
  constructor(private readonly config: ErrorClassifierMessageMapConfig) {}

  classify(error: unknown): Response | null {
    if (!(error instanceof Error)) return null;

    const match = this.config[error.message];

    if (!match) return null;

    return Response.json({ message: match.message }, { status: match.status });
  }
}
