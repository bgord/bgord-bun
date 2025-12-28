import type * as tools from "@bgord/tools";

export const TimeoutCancellableError = { Exceeded: "timeout.cancellable.exceeded" };

export interface TimeoutCancellableRunnerPort {
  cancellable<T>(action: (signal: AbortSignal) => Promise<T>, timeout: tools.Duration): Promise<T>;
}
