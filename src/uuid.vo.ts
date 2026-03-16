import * as v from "valibot";

export const UUIDError = { Type: "uuid.type" } as const;

export const UUID = v.pipe(v.string(UUIDError.Type), v.uuid(UUIDError.Type));

export type UUIDType = v.InferOutput<typeof UUID>;
