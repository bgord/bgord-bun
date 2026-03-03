import { type Invariant, InvariantFailureKind } from "./invariant.service";

type BaseInvariantType = Invariant<any>;
type InvariantMessageType = BaseInvariantType["message"];
type ErrorResponseTupleType = [{ message: InvariantMessageType; _known: true }, number];

export class InvariantErrorHandler {
  static detect(invariants: ReadonlyArray<BaseInvariantType>, error: unknown): BaseInvariantType | undefined {
    return invariants.find((invariant) => error instanceof invariant.error);
  }

  static respond(error: BaseInvariantType): ErrorResponseTupleType {
    const code: Record<InvariantFailureKind, number> = {
      [InvariantFailureKind.forbidden]: 403,
      [InvariantFailureKind.not_found]: 404,
      [InvariantFailureKind.precondition]: 400,
    };

    return [{ message: error.message, _known: true }, code[error.kind]];
  }
}
