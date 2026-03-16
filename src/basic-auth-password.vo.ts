import * as v from "valibot";

export const BasicAuthPasswordError = {
  Type: "basic.auth.password.type",
  Empty: "basic.auth.password.empty",
  TooLong: "basic.auth.password.too.long",
};

export const BasicAuthPassword = v.pipe(
  v.string(BasicAuthPasswordError.Type),
  v.minLength(1, BasicAuthPasswordError.Empty),
  v.maxLength(128, BasicAuthPasswordError.TooLong),
  // Stryker disable next-line StringLiteral
  v.brand("BasicAuthPassword"),
);

export type BasicAuthPasswordType = v.InferOutput<typeof BasicAuthPassword>;
