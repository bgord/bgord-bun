import type * as tools from "@bgord/tools";
import type { SleeperPort } from "./sleeper.port";

export class SleeperSystemAdapter implements SleeperPort {
  async wait(duration: tools.Duration) {
    await Bun.sleep(duration.ms);
  }
}
