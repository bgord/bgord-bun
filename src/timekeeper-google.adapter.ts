import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { TimekeeperPort } from "./timekeeper.port";

export class TimekeeperGoogleAdapter implements TimekeeperPort {
  static URL = v.parse(tools.UrlWithoutSlash, "https://www.google.com/generate_204");

  async get(): Promise<tools.Timestamp | null> {
    try {
      const response = await fetch(TimekeeperGoogleAdapter.URL);
      const date = response.headers.get("Date");

      if (!date) return null;
      return tools.Timestamp.fromDateLike(date);
    } catch {
      return null;
    }
  }
}
