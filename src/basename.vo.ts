import { z } from "zod/v4";

export const BasenameSchema = z
  .string()
  .trim()
  .min(1, "basename_empty")
  .max(128, "basename_too_long")
  .refine((s) => !/[/\\]/.test(s), "basename_slashes_forbidden")
  .refine((s) => !/[\u0000-\u001F\u007F]/.test(s), "basename_control_chars_forbidden")
  // check dot-segments FIRST so "." / ".." get the intended error
  .refine((s) => s !== "." && s !== "..", "basename_dot_segments_forbidden")
  // then disallow any other dotfile (".env", ".gitignore", etc.)
  .refine((s) => !s.startsWith("."), "basename_dotfiles_forbidden")
  .refine((s) => !s.endsWith("."), "basename_trailing_dot_forbidden")
  .regex(/^[A-Za-z0-9._-]+$/, "basename_bad_chars")
  .brand("basename");

export type BasenameType = z.infer<typeof BasenameSchema>;
