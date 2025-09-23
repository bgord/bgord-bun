import cloneDeepWith from "lodash/cloneDeepWith";
import type { RedactorPort } from "./redactor.port";

export class RedactorCompactAdapter implements RedactorPort {
  redact<T>(input: T): T {
    return cloneDeepWith(input, (value) =>
      Array.isArray(value) ? { type: "Array", length: value.length } : undefined,
    );
  }
}
