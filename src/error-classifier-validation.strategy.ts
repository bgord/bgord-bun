import type { ErrorClassifierStrategy } from "./error-classifier.strategy";

export type ErrorClassifierValidationConfig = { errors: ReadonlyArray<string> };

type ValidationErrorLike = { issues: ReadonlyArray<{ message: string }> };

export class ErrorClassifierValidationStrategy implements ErrorClassifierStrategy {
  constructor(private readonly config: ErrorClassifierValidationConfig) {}

  classify(error: unknown): Response | null {
    if (!ErrorClassifierValidationStrategy.isValidationError(error)) return null;

    const validationError = error.issues.find((issue) => this.config.errors.includes(issue.message));

    return Response.json({ message: validationError?.message ?? "payload.invalid.error" }, { status: 400 });
  }

  private static isValidationError(error: unknown): error is ValidationErrorLike {
    if (!(error instanceof Error)) return false;

    const issues = (error as Partial<ValidationErrorLike>).issues;

    if (!Array.isArray(issues)) return false;
    if (issues.length === 0) return false;

    return issues.every((issue) => typeof issue?.message === "string");
  }
}
