import type * as tools from "@bgord/tools";
import type { SleeperPort } from "./sleeper.port";

export class SleeperNoopAdapter implements SleeperPort {
  async wait(_duration: tools.Duration): Promise<void> {}
}
