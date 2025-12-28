import type * as tools from "@bgord/tools";
import type { TimeoutRunnerPort } from "./timeout-runner.port";

export class TimeoutRunnerNoopAdapter implements TimeoutRunnerPort {
  async run<T>(action: Promise<T>, _timeout: tools.Duration): Promise<T> {
    return action;
  }
}
