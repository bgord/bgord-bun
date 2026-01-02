import * as tools from "@bgord/tools";
import type { TimekeeperPort } from "./timekeeper.port";

export class TimekeeperGoogleAdapter implements TimekeeperPort {
  static URL = tools.UrlWithoutSlash.parse("https://www.google.com/generate_204");

  async get() {
    try {
      const response = await fetch(TimekeeperGoogleAdapter.URL);

      const date = response.headers.get("Date");

      if (!date) return null;
      return tools.Timestamp.fromDateLike(date);
    } catch (error) {
      return null;
    }
  }
}
