import { z } from "zod/v4";

export type GenericEventSchema = z.ZodObject<{
  id: z.ZodType<string>;
  correlationId: z.ZodType<string>;
  createdAt: z.ZodType<number>;
  stream: z.ZodString;
  revision: z.ZodNumber;
  name: z.ZodLiteral<string>;
  version: z.ZodLiteral<number>;
  payload: z.ZodType<any>;
}>;

export type GenericParsedEventSchema = z.ZodObject<
  Omit<GenericEventSchema["shape"], "payload"> & {
    payload: z.ZodString;
  }
>;
