import type { SleeperPort } from "./sleeper.port";

export class SleeperNoopAdapter implements SleeperPort {
  async wait(): Promise<void> {}
}
