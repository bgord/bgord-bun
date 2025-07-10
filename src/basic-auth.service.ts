import { z } from "zod";

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
    const credentials = btoa(`${username}:${password}`);

    return { authorization: `Basic ${credentials}` };
  }

  static toHeader(username: BasicAuthUsernameType, password: BasicAuthPasswordType): Headers {
    return new Headers(BasicAuth.toHeaderValue(username, password));
  }
}
