import type * as tools from "@bgord/tools";

export interface SleeperPort {
  wait(duration: tools.Duration): Promise<void>;
}
