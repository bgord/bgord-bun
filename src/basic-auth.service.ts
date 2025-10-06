import { z } from "zod/v4";

export const BasicAuthUsernameTypeError = { error: "basic.auth.username.invalid_type" } as const;
export const BasicAuthUsernameLengthError = { error: "basic.auth.username.invalid_length" } as const;
export const BasicAuthUsername = z
  .string(BasicAuthUsernameTypeError)
  .min(1, BasicAuthUsernameLengthError)
  .max(128, BasicAuthUsernameLengthError)
  .brand("BasicAuthUsername");
export type BasicAuthUsernameType = z.infer<typeof BasicAuthUsername>;

export const BasicAuthPasswordTypeError = { error: "basic.auth.password.invalid_type" } as const;
export const BasicAuthPasswordLengthError = { error: "basic.auth.password.invalid_length" } as const;
export const BasicAuthPassword = z
  .string(BasicAuthPasswordTypeError)
  .min(1, BasicAuthPasswordLengthError)
  .max(128, BasicAuthPasswordLengthError)
  .brand("BasicAuthPassword");
export type BasicAuthPasswordType = z.infer<typeof BasicAuthPassword>;

type BasicAuthHeaderValueType = { authorization: string };

export class BasicAuth {
  static toHeaderValue(
    username: BasicAuthUsernameType,
    password: BasicAuthPasswordType,
  ): BasicAuthHeaderValueType {
    return { authorization: `Basic ${btoa(`${username}:${password}`)}` };
  }

  static toHeader(username: BasicAuthUsernameType, password: BasicAuthPasswordType): Headers {
    return new Headers(BasicAuth.toHeaderValue(username, password));
  }
}
