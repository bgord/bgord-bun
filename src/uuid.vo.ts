import * as z from "zod/v4";

export const UUIDError = { Type: "uuid.type" } as const;

export const UUID = z.uuid(UUIDError.Type);

export type UUIDType = z.infer<typeof UUID>;
