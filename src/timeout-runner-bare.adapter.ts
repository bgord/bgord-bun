import type * as tools from "@bgord/tools";
import { TimeoutError, type TimeoutRunnerPort } from "./timeout-runner.port";

export class TimeoutRunnerBareAdapter implements TimeoutRunnerPort {
  async run<T>(action: Promise<T>, timeout: tools.Duration): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const reason = new Error(TimeoutError.Exceeded);

      const canceller = setTimeout(() => reject(reason), timeout.ms);

      action.then(
        (value) => {
          clearTimeout(canceller);
          resolve(value);
        },
        (error) => {
          clearTimeout(canceller);
          reject(error);
        },
      );
    });
  }
}
