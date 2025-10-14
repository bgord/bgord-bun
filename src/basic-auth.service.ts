import type { BasicAuthPasswordType } from "./basic-auth-password.vo";
import type { BasicAuthUsernameType } from "./basic-auth-username.vo";

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
