import * as v from "valibot";

export const BasicAuthUsernameError = {
  Type: "basic.auth.username.type",
  Empty: "basic.auth.username.empty",
  TooLong: "basic.auth.username.too.long",
  NonLatin: "basic.auth.username.non.latin",
};

export const BasicAuthUsername = v.pipe(
  v.string(BasicAuthUsernameError.Type),
  v.minLength(1, BasicAuthUsernameError.Empty),
  v.maxLength(128, BasicAuthUsernameError.TooLong),
  v.check(
    (value) => [...value].every((character) => character.charCodeAt(0) < 256),
    BasicAuthUsernameError.NonLatin,
  ),
  // Stryker disable next-line StringLiteral
  v.brand("BasicAuthUsername"),
);

export type BasicAuthUsernameType = v.InferOutput<typeof BasicAuthUsername>;
