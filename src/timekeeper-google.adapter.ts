import * as tools from "@bgord/tools";
import type { TimekeeperPort } from "./timekeeper.port";

export class TimekeeperGoogleAdapter implements TimekeeperPort {
  async get() {
    try {
      const response = await fetch("https://www.google.com/generate_204");
      if (!response.ok) return null;

      const date = response.headers.get("Date");
      if (!date) return null;

      return tools.Timestamp.fromNumber(new Date(date).getTime());
    } catch (error) {
      return null;
    }
  }
}
