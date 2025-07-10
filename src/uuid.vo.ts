import { z } from "zod";

import { NewUUID } from "./new-uuid.service";

export const UUID = z.uuid().default(() => NewUUID.generate());

export type UUIDType = z.infer<typeof UUID>;
