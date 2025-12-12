import type { BasicAuthPasswordType } from "./basic-auth-password.vo";
import type { BasicAuthUsernameType } from "./basic-auth-username.vo";

type BasicAuthConfigType = { username: BasicAuthUsernameType; password: BasicAuthPasswordType };

export class BasicAuth {
  static toHeaderValue(config: BasicAuthConfigType): { authorization: string } {
    return { authorization: `Basic ${btoa(`${config.username}:${config.password}`)}` };
  }

  static toHeader(config: BasicAuthConfigType): Headers {
    return new Headers(BasicAuth.toHeaderValue(config));
  }
}
