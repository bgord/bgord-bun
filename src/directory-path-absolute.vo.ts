import { z } from "zod/v4";

export const DirectoryPathAbsoluteSchema = z
  .string()
  .trim()
  .refine((value) => value.startsWith("/"), "abs_dir_must_start_with_slash")
  .refine((value) => !value.includes("\\"), "abs_dir_backslash_forbidden")
  .refine((value) => !/[\u0000-\u001F\u007F]/.test(value), "abs_dir_control_chars_forbidden")
  .transform((value) => value.replace(/\/{2,}/g, "/"))
  .transform((value) => (value !== "/" && value.endsWith("/") ? value.slice(0, -1) : value))
  .refine((value) => {
    if (value === "/") return true;
    const segments = value.slice(1).split("/");
    return segments.every(
      (segment) =>
        segment.length > 0 && /^[A-Za-z0-9._-]+$/.test(segment) && segment !== "." && segment !== "..",
    );
  }, "abs_dir_bad_segments")
  .brand("absolute_directory_path");

export type DirectoryPathAbsoluteType = z.infer<typeof DirectoryPathAbsoluteSchema>;
