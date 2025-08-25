import { z } from "zod/v4";

export const FilenameSuffixSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[^A-Za-z0-9_-]/g, ""))
  .pipe(z.string().max(32, "suffix_too_long"))
  .brand("basename_suffix");

export type FilenameSuffixSchemaType = z.infer<typeof FilenameSuffixSchema>;
