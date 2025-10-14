import type { BasicAuthPasswordType } from "./basic-auth-password.vo";
import type { BasicAuthUsernameType } from "./basic-auth-username.vo";

export class BasicAuth {
  static toHeaderValue(
    username: BasicAuthUsernameType,
    password: BasicAuthPasswordType,
  ): { authorization: string } {
    return { authorization: `Basic ${btoa(`${username}:${password}`)}` };
  }

  static toHeader(username: BasicAuthUsernameType, password: BasicAuthPasswordType): Headers {
    return new Headers(BasicAuth.toHeaderValue(username, password));
  }
}
