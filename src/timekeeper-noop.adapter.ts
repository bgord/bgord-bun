import type { ClockPort } from "./clock.port";
import type { TimekeeperPort } from "./timekeeper.port";

export class TimekeeperNoopAdapter implements TimekeeperPort {
  constructor(private readonly clock: ClockPort) {}

  async get() {
    return this.clock.now();
  }
}
