import * as tools from "@bgord/tools";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorErrorCauseDepthLimit implements RedactorStrategy {
  constructor(private readonly max: tools.IntegerNonNegativeType) {}

  redact<T>(input: T): T {
    if (!tools.isPlainObject(input)) return input;
    if (!tools.ErrorNormalizer.isNormalizedError(input["error"])) return input;
    return { ...input, error: this.limit(input["error"], tools.Int.nonNegative(0)) };
  }

  private limit(error: tools.NormalizedError, depth: tools.IntegerNonNegativeType): tools.NormalizedError {
    if (!error.cause || depth >= this.max) return { ...error, cause: undefined };
    return { ...error, cause: this.limit(error.cause, tools.Int.nonNegative(depth + 1)) };
  }
}
