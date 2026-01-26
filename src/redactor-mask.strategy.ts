import { deepCloneWith } from "./deep-clone-with";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorMask implements RedactorStrategy {
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
    this.keys = new Set((keys?.length ? keys : RedactorMask.DEFAULT_KEYS).map((key) => key.toLowerCase()));
  }

  redact<T>(input: T): T {
    return deepCloneWith(input, (_value, key) =>
      typeof key === "string" && this.keys.has(key.toLowerCase()) ? "***" : undefined,
    );
  }
}
