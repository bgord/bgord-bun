import { z } from "zod/v4";

export const Path = z.string().min(1).brand<"path">();
export type PathType = z.infer<typeof Path>;
