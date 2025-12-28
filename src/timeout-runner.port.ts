import type * as tools from "@bgord/tools";

export const TimeoutError = { Exceeded: "timeout.exceeded" };

export interface TimeoutRunnerPort {
  run<T>(action: Promise<T>, timeout: tools.Duration): Promise<T>;
}
