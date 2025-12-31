import { z } from "zod/v4";

export const BasicAuthPasswordError = {
  Type: "basic.auth.password.type",
  Empty: "basic.auth.password.empty",
  TooLong: "basic.auth.password.too.long",
};

// Stryker disable all
export const BasicAuthPassword = z
  // Stryker restore all
  .string(BasicAuthPasswordError.Type)
  .min(1, BasicAuthPasswordError.Empty)
  .max(128, BasicAuthPasswordError.TooLong)
  .brand("BasicAuthPassword");

export type BasicAuthPasswordType = z.infer<typeof BasicAuthPassword>;
