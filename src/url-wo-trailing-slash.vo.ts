import { z } from "zod";

export const UrlWithoutTrailingSlash = z
  .url()
  .trim()
  .min(1)
  .refine((value) => !value.endsWith("/"), {
    message: "url_cannot_end_with_trailing_slash",
  })
  .brand("UrlWithoutTrailingSlash");

export type UrlWithoutTrailingSlashType = z.infer<typeof UrlWithoutTrailingSlash>;
