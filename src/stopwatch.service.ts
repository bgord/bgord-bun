import * as tools from "@bgord/tools";

export const StopwatchError = { AlreadyStopped: "stopwatch.already.stopped" };

enum StopwatchState {
  started = "started",
  stopped = "stopped",
}

export type StopwatchResultType = tools.Duration;

export class Stopwatch {
  private state: StopwatchState = StopwatchState.started;

  constructor(private readonly start: tools.Timestamp) {}

  stop(): StopwatchResultType {
    if (this.state === StopwatchState.stopped) throw new Error(StopwatchError.AlreadyStopped);

    this.state = StopwatchState.stopped;

    return tools.Timestamp.fromNumber(Date.now()).difference(this.start);
  }
}
