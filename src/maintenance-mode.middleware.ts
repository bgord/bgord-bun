import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export type MaintenanceModeConfigType = { enabled: boolean; RetryAfter?: tools.Duration };

export class MaintenanceMode {
  static build = (config?: MaintenanceModeConfigType) =>
    createMiddleware(async (c, next) => {
      const enabled = config?.enabled ?? false;
      const RetryAfter = config?.RetryAfter ?? tools.Duration.Hours(1);

      if (!enabled) return next();
      return c.json({ reason: "maintenance" }, 503, { "Retry-After": RetryAfter.seconds.toString() });
    });
}
