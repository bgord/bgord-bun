import type * as tools from "@bgord/tools";
import { TimeoutError, type TimeoutRunnerPort } from "./timeout-runner.port";

export class TimeoutRunnerErrorAdapter implements TimeoutRunnerPort {
  async run<T>(_action: Promise<T>, _timeout: tools.Duration): Promise<T> {
    throw new Error(TimeoutError.Exceeded);
  }
}
