import type * as tools from "@bgord/tools";
import type { SleeperPort } from "./sleeper.port";

export type SlowerMiddlewareDependencies = { Sleeper: SleeperPort };

export class SlowerMiddleware {
  constructor(
    private readonly offset: tools.Duration,
    private readonly deps: SlowerMiddlewareDependencies,
  ) {}

  async evaluate(): Promise<void> {
    await this.deps.Sleeper.wait(this.offset);
  }
}
