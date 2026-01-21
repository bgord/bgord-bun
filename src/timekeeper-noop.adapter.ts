import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { TimekeeperPort } from "./timekeeper.port";

type Dependencies = { Clock: ClockPort };

export class TimekeeperNoopAdapter implements TimekeeperPort {
  constructor(private readonly deps: Dependencies) {}

  async get(): Promise<tools.Timestamp | null> {
    return this.deps.Clock.now();
  }
}
