import { z } from "zod/v4";

export const BasicAuthUsernameError = {
  Type: "basic.auth.username.type",
  Empty: "basic.auth.username.empty",
  TooLong: "basic.auth.username.too.long",
} as const;

export const BasicAuthUsername = z
  .string(BasicAuthUsernameError.Type)
  .min(1, BasicAuthUsernameError.Empty)
  .max(128, BasicAuthUsernameError.TooLong)
  .brand("BasicAuthUsername");

export type BasicAuthUsernameType = z.infer<typeof BasicAuthUsername>;
