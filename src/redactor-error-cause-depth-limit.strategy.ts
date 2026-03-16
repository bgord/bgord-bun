import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ErrorNormalizer, type NormalizedError } from "./error-normalizer.service";
import { isPlainObject } from "./is-plain-object";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorErrorCauseDepthLimit implements RedactorStrategy {
  constructor(private readonly max: tools.IntegerNonNegativeType) {}

  redact<T>(input: T): T {
    // Stryker disable all
    if (!isPlainObject(input)) return input;
    // Stryker restore all
    if (!ErrorNormalizer.isNormalizedError(input.error)) return input;

    return { ...input, error: this.limit(input.error, v.parse(tools.IntegerNonNegative, 0)) };
  }

  private limit(error: NormalizedError, depth: tools.IntegerNonNegativeType): NormalizedError {
    if (!error.cause || depth >= this.max) return { ...error, cause: undefined };
    return { ...error, cause: this.limit(error.cause, v.parse(tools.IntegerNonNegative, depth + 1)) };
  }
}
