import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

type Dependencies = { Clock: ClockPort };

export class ClockOffsetAdapter implements ClockPort {
  constructor(
    private readonly offset: tools.Duration,
    private readonly deps: Dependencies,
  ) {}

  now(): tools.Timestamp {
    return this.deps.Clock.now().add(this.offset);
  }
}
