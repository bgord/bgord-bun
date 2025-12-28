import type { TimeoutCancellableRunnerPort } from "./timeout-cancellable-runner.port";

export class TimeoutCancellableRunnerNoop implements TimeoutCancellableRunnerPort {
  async cancellable<T>(action: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const controller = new AbortController();

    return action(controller.signal);
  }
}
