import * as tools from "@bgord/tools";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorErrorStackHide implements RedactorStrategy {
  redact<T>(input: T): T {
    if (!tools.isPlainObject(input)) return input;
    if (!tools.ErrorNormalizer.isNormalizedError(input["error"])) return input;
    return { ...input, error: this.hide(input["error"]) };
  }

  private hide(error: tools.NormalizedError): tools.NormalizedError {
    return {
      ...error,
      stack: undefined,
      cause: error.cause ? this.hide(error.cause) : undefined,
    };
  }
}
