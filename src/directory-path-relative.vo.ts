import { z } from "zod/v4";

export const DirectoryPathRelativeSchema = z
  .string()
  .trim()
  .refine((value) => !value.startsWith("/"), "rel_dir_must_not_start_with_slash")
  .refine((value) => !value.includes("\\"), "rel_dir_backslash_forbidden")
  .refine((value) => !/[\u0000-\u001F\u007F]/.test(value), "rel_dir_control_chars_forbidden")
  .transform((value) => value.replace(/\/{2,}/g, "/"))
  .transform((value) => value.replace(/^\/+|\/+$/g, ""))
  .refine((value) => value.length > 0, "rel_dir_empty")
  .refine(
    (value) =>
      value
        .split("/")
        .every((segment) => /^[A-Za-z0-9._-]+$/.test(segment) && segment !== "." && segment !== ".."),
    "rel_dir_bad_segments",
  )
  .brand("relative_directory_path");

export type DirectoryPathRelativeType = z.infer<typeof DirectoryPathRelativeSchema>;
