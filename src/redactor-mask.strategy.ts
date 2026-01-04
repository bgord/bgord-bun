import cloneDeepWith from "lodash/cloneDeepWith";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorMaskStrategy implements RedactorStrategy {
  static readonly DEFAULT_KEYS: readonly string[] = [
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "apikey",
    "token",
    "accesstoken",
    "refreshtoken",
    "password",
    "currentpassword",
    "newpassword",
    "passwordconfirmation",
    "clientsecret",
    "secret",
    "otp",
    "code",
  ];

  private readonly keys: Set<string>;

  constructor(keys?: readonly string[]) {
    this.keys = keys?.length
      ? new Set(keys.map((key) => key.toLowerCase()))
      : new Set(RedactorMaskStrategy.DEFAULT_KEYS);
  }

  redact<T>(input: T): T {
    return cloneDeepWith(input, (_value, key) => {
      if (typeof key === "string" && this.keys.has(key.toLowerCase())) return "***";
      return undefined;
    });
  }
}
