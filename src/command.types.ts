import { z } from "zod/v4";

export type GenericCommandSchema = z.ZodObject<{
  id: z.ZodType<string>;
  correlationId: z.ZodType<string>;
  createdAt: z.ZodType<number>;
  name: z.ZodLiteral<string>;
  payload: z.ZodType<any>;
}>;

export type GenericParsedCommandSchema = z.ZodObject<
  Omit<GenericCommandSchema["shape"], "payload"> & {
    payload: z.ZodString;
  }
>;
