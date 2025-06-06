import { z } from "zod/v4";

export const UrlWithoutTrailingSlash = z
  .url()
  .trim()
  .min(1)
  .refine((value) => !value.endsWith("/"), {
    message: "url_cannot_end_with_trailing_slash",
  });

export type UrlWithoutTrailingSlashType = z.infer<typeof UrlWithoutTrailingSlash>;
