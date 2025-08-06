import type { Invariant } from "./invariant.service";

type BaseInvariantType = Invariant<any>;

type InvariantMessageType = BaseInvariantType["message"];
type InvariantCodeType = BaseInvariantType["code"];

type ErrorResponseTupleType = [{ message: InvariantMessageType; _known: true }, InvariantCodeType];

export class InvariantErrorHandler {
  error: BaseInvariantType | undefined = undefined;

  constructor(private readonly invariants: BaseInvariantType[]) {}

  detect(error: unknown) {
    this.error = this.invariants.find((invariant) => error instanceof invariant.error);
    return this;
  }

  static respond(error: BaseInvariantType): ErrorResponseTupleType {
    return [{ message: error.message, _known: true }, error.code];
  }
}
