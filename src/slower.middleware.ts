import type * as tools from "@bgord/tools";
import type { SleeperPort } from "./sleeper.port";

type Dependencies = { Sleeper: SleeperPort };

export class SlowerMiddleware {
  constructor(
    private readonly offset: tools.Duration,
    private readonly deps: Dependencies,
  ) {}

  async evaluate(): Promise<void> {
    await this.deps.Sleeper.wait(this.offset);
  }
}
