import * as v from "valibot";

export const SmsBodyError = {
  Type: "sms.body.type",
  Empty: "sms.body.empty",
  TooLong: "sms.body.too.long",
};

export const SmsBody = v.pipe(
  v.string(SmsBodyError.Type),
  v.minLength(1, SmsBodyError.Empty),
  v.maxLength(640, SmsBodyError.TooLong),
  // Stryker disable next-line StringLiteral
  v.brand("SmsBody"),
);

export type SmsBodyType = v.InferOutput<typeof SmsBody>;
