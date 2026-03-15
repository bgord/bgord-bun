import type * as z from "zod/v4";

export type GenericEventSchema = z.ZodObject<{
  id: z.ZodType<string>;
  correlationId: z.ZodType<string>;
  createdAt: z.ZodType<number>;
  stream: z.ZodString;
  revision: z.ZodOptional<z.ZodType<number>>;
  name: z.ZodLiteral<string>;
  version: z.ZodLiteral<number>;
  payload: z.ZodType<any>;
}>;

export type GenericParsedEventSchema = z.ZodObject<
  Omit<GenericEventSchema["shape"], "payload"> & { payload: z.ZodString }
>;

// TODO: use proper VO types.
export type GenericEvent = {
  id: string;
  correlationId: string;
  createdAt: number;
  stream: string;
  revision?: number;
  name: string;
  version: number;
  payload: unknown;
};

export type GenericParsedEvent = Omit<GenericEvent, "payload"> & { payload: string };
