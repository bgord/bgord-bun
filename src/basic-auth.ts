import { z } from "zod/v4";

export const BasicAuthUsername = z.string().min(1).max(128);
export type BasicAuthUsernameType = z.infer<typeof BasicAuthUsername>;

export const BasicAuthPassword = z.string().min(1).max(128);
export type BasicAuthPasswordType = z.infer<typeof BasicAuthPassword>;
