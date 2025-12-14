import * as tools from "@bgord/tools";
import type { TimekeeperPort } from "./timekeeper.port";

export class TimekeeperGoogleAdapter implements TimekeeperPort {
  static URL = tools.UrlWithoutSlash.parse("https://www.google.com/generate_204");

  async get(signal?: AbortSignal) {
    try {
      const response = await fetch(TimekeeperGoogleAdapter.URL, { signal });
      if (!response.ok) return null;

      const date = response.headers.get("Date");
      if (!date) return null;

      return tools.Timestamp.fromNumber(new Date(date).getTime());
    } catch (error) {
      return null;
    }
  }
}
