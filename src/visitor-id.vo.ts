import { z } from "zod/v4";

export const VisitorIdError = {
  Type: "visitor.id.type",
  Empty: "visitor.id.empty",
  TooLong: "visitor.id.too.long",
} as const;

export const VisitorId = z
  .string(VisitorIdError.Type)
  .min(1, VisitorIdError.Empty)
  .max(16, VisitorIdError.TooLong)
  .brand("VisitorId");

export type VisitorIdType = z.infer<typeof VisitorId>;
