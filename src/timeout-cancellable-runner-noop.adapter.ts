import type * as tools from "@bgord/tools";
import type { TimeoutCancellableRunnerPort } from "./timeout-cancellable-runner.port";

export class TimeoutCancellableRunnerNoop implements TimeoutCancellableRunnerPort {
  async cancellable<T>(action: (signal: AbortSignal) => Promise<T>, _timeout: tools.Duration): Promise<T> {
    const controller = new AbortController();

    return action(controller.signal);
  }
}
