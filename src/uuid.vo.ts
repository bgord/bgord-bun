import { z } from "zod/v4";

export const UUID = z.uuid();

export type UUIDType = z.infer<typeof UUID>;
