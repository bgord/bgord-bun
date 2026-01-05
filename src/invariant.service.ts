import type { Constructor } from "@bgord/tools";

type BaseInvariantConfig = Record<string, unknown>;

export enum InvariantFailureKind {
  forbidden = "forbidden",
  precondition = "precondition",
  not_found = "not_found",
}

export abstract class Invariant<T extends BaseInvariantConfig> {
  abstract passes(config: T): boolean;

  abstract error: Constructor<Error>;

  abstract message: string;

  abstract kind: InvariantFailureKind;

  throw() {
    throw new this.error();
  }

  enforce(config: T) {
    if (!this.passes(config)) this.throw();
  }
}
