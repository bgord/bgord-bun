import type * as tools from "@bgord/tools";
import type { z } from "zod/v4";

export interface Secret<T> {
  key: tools.ObjectKeyType;
  schema: z.ZodType<T>;
}
