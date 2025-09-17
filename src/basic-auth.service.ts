import { z } from "zod/v4";

export const BasicAuthUsername = z.string().min(1).max(128).brand("BasicAuthUsername");
export type BasicAuthUsernameType = z.infer<typeof BasicAuthUsername>;

export const BasicAuthPassword = z.string().min(1).max(128).brand("BasicAuthPassword");
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
