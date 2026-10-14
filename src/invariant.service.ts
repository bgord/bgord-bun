import type { Constructor } from "@bgord/tools";

type Config = Record<string, unknown>;

export enum InvariantFailureKind {
  forbidden = "forbidden",
  precondition = "precondition",
  not_found = "not_found",
}

export abstract class Invariant<T extends Config, N extends T = T> {
  abstract passes(config: T): boolean;

  abstract error: Constructor<Error>;

  abstract message: string;

  abstract kind: InvariantFailureKind;

  throw() {
    throw new this.error(this.message);
  }

  enforce(config: T): N {
    if (!this.passes(config)) this.throw();

    return config as N;
  }
}
