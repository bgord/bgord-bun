import { z } from "zod/v4";

import { NewUUID } from "./new-uuid";

export const UUID = z.uuid().default(() => NewUUID.generate());

export type UUIDType = z.infer<typeof UUID>;
