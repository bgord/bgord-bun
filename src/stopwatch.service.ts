import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

type Dependencies = { Clock: ClockPort };

export const StopwatchError = { AlreadyStopped: "stopwatch.already.stopped" };

enum StopwatchState {
  started = "started",
  stopped = "stopped",
}

export type StopwatchResultType = tools.Duration;

export class Stopwatch {
  private state: StopwatchState = StopwatchState.started;
  private readonly start: tools.Timestamp;

  constructor(private readonly deps: Dependencies) {
    this.start = deps.Clock.now();
  }

  stop(): StopwatchResultType {
    if (this.state === StopwatchState.stopped) throw new Error(StopwatchError.AlreadyStopped);

    this.state = StopwatchState.stopped;

    return this.deps.Clock.now().difference(this.start);
  }
}
