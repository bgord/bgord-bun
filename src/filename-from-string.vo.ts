import { z } from "zod/v4";
import { BasenameSchema } from "./basename.vo";
import { ExtensionSchema } from "./extension.vo";

export const FilenameFromStringSchema = z
  .string()
  .trim()
  .refine((string) => {
    const index = string.lastIndexOf(".");
    return index > 0 && index < string.length - 1;
  }, "filename_invalid")
  // split and validate parts using existing schemas
  .transform((string) => {
    const index = string.lastIndexOf(".");
    const base = BasenameSchema.parse(string.slice(0, index));
    const extension = ExtensionSchema.parse(string.slice(index + 1));
    return { basename: base, extension: extension };
  });

export type FilenameFromString = z.infer<typeof FilenameFromStringSchema>;
