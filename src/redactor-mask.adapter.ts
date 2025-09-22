import cloneDeepWith from "lodash/cloneDeepWith";
import type { RedactorPort } from "./redactor.port";

export class RedactorMaskAdapter implements RedactorPort {
  static readonly DEFAULT_KEYS: readonly string[] = [
    // auth & cookies
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "apiKey",
    "token",
    "accessToken",
    "refreshToken",

    // passwords & secrets
    "password",
    "currentPassword",
    "newPassword",
    "passwordConfirmation",
    "clientSecret",
    "secret",

    // one-time codes
    "otp",
    "code",
  ];

  private readonly keys: Set<string>;

  constructor(keys: readonly string[]) {
    this.keys = new Set(keys.map((key) => key.toLowerCase()));
  }

  redact<T>(input: T): T {
    return cloneDeepWith(input, (_value, key) => {
      if (typeof key === "string" && this.keys.has(key.toLowerCase())) return "***";
      return undefined;
    });
  }
}
