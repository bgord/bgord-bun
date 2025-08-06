import type { Constructor } from "@bgord/tools";
import type { ContentfulStatusCode } from "hono/utils/http-status";

type BaseInvariantConfig = Record<string, unknown>;

export abstract class Invariant<T extends BaseInvariantConfig> {
  abstract fails(config: T): boolean;

  abstract error: Constructor<Error>;

  abstract message: string;

  abstract code: ContentfulStatusCode;

  throw() {
    throw new this.error();
  }

  perform(config: T) {
    if (this.fails(config)) {
      this.throw();
    }
  }

  passes(config: T) {
    return !this.fails(config);
  }
}
