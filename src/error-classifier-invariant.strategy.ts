import type { ErrorClassifierStrategy } from "./error-classifier.strategy";
import { type Invariant, InvariantFailureKind } from "./invariant.service";

export type ErrorClassifierInvariantConfig = ReadonlyArray<Record<string, Invariant<any>>>;

export class ErrorClassifierInvariantStrategy implements ErrorClassifierStrategy {
  private static readonly code: Record<InvariantFailureKind, number> = {
    [InvariantFailureKind.forbidden]: 403,
    [InvariantFailureKind.not_found]: 404,
    [InvariantFailureKind.precondition]: 400,
  };

  private readonly invariants: ReadonlyArray<Invariant<any>>;

  constructor(config: ErrorClassifierInvariantConfig) {
    this.invariants = config.flatMap((module) => Object.values(module));
  }

  classify(error: unknown): Response | null {
    const invariant = this.invariants.find((candidate) => error instanceof candidate.error);

    if (!invariant) return null;

    return Response.json(
      { message: invariant.message },
      { status: ErrorClassifierInvariantStrategy.code[invariant.kind] },
    );
  }
}
