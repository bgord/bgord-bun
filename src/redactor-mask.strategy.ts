/* cspell:disable */
import * as tools from "@bgord/tools";
import type { RedactorStrategy } from "./redactor.strategy";
import { RedactorKey } from "./redactor-key.vo";

export class RedactorMask implements RedactorStrategy {
  static readonly DEFAULT_KEYS: ReadonlyArray<string> = [
    "authorization",
    "proxy-authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "x-auth-token",
    "apikey",
    "token",
    "accesstoken",
    "refreshtoken",
    "idtoken",
    "password",
    "currentpassword",
    "newpassword",
    "passwordconfirmation",
    "clientsecret",
    "privatekey",
    "secret",
    "otp",
    "code",
  ];

  private readonly keys: Set<string>;

  constructor(keys?: ReadonlyArray<string>) {
    this.keys = new Set(
      (keys?.length ? keys : RedactorMask.DEFAULT_KEYS).map((key) => RedactorKey.fromString(key).get()),
    );
  }

  redact<T>(input: T): T {
    return tools.deepCloneWith(input, (_value, key) =>
      typeof key === "string" && this.keys.has(RedactorKey.fromString(key).get()) ? "***" : undefined,
    );
  }
}
