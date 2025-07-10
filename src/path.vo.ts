import { z } from "zod";

export const Path = z.string().min(1);

export type PathType = z.infer<typeof Path>;
