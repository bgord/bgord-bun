import type { ErrorClassifierStrategy } from "./error-classifier.strategy";

export type ErrorClassifierValidationConfig = ReadonlyArray<string | Record<string, string>>;

type ValidationErrorLike = { issues: ReadonlyArray<{ message: string }> };

export class ErrorClassifierValidationStrategy implements ErrorClassifierStrategy {
  private readonly errors: ReadonlySet<string>;

  constructor(config: ErrorClassifierValidationConfig) {
    this.errors = new Set(
      config.flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry))),
    );
  }

  classify(error: unknown): Response | null {
    if (!ErrorClassifierValidationStrategy.isValidationError(error)) return null;

    const validationError = error.issues.find((issue) => this.errors.has(issue.message));

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
