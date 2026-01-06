import type * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import type { SleeperPort } from "./sleeper.port";

type Dependencies = { Sleeper: SleeperPort };

export class Slower {
  static handle = (offset: tools.Duration, deps: Dependencies) =>
    createMiddleware(async (_, next) => {
      await deps.Sleeper.wait(offset);

      return next();
    });
}
