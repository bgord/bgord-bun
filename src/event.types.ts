import * as tools from "@bgord/tools";
import { z } from "zod/v4";
import { UUID } from "./uuid.vo";

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
  Omit<GenericEventSchema["shape"], "payload"> & {
    payload: z.ZodString;
  }
>;

export const BaseEventData = {
  id: UUID,
  correlationId: UUID,
  createdAt: tools.Timestamp,
  stream: z.string().min(1),
  version: z.literal(1),
  revision: tools.RevisionValue.optional(),
};
