import { z } from "zod/v4";

export const ExtensionSchema = z
  .string()
  .trim()
  .transform((value) => (value.startsWith(".") ? value.slice(1) : value))
  .transform((value) => value.toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "extension_empty")
      .max(16, "extension_too_long")
      .regex(/^[a-z0-9]+$/, "extension_bad_chars"),
  )
  .brand("extension");

export type ExtensionType = z.infer<typeof ExtensionSchema>;
