import type * as tools from "@bgord/tools";
import {
  TimeoutCancellableError,
  type TimeoutCancellableRunnerPort,
} from "./timeout-cancellable-runner.port";

export class TimeoutCancellableRunnerBare implements TimeoutCancellableRunnerPort {
  async cancellable<T>(action: (signal: AbortSignal) => Promise<T>, timeout: tools.Duration): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const controller = new AbortController();

      const reason = new Error(TimeoutCancellableError.Exceeded);

      const canceller = setTimeout(() => {
        controller.abort(reason);
        reject(reason);
      }, timeout.ms);

      // Promise.resolve.then used to prevent the initial action(controller.signal) call
      // from throwing before the resulting promise is run by Promise.then.
      const promise: Promise<T> = Promise.resolve().then(() => action(controller.signal));

      promise.then(
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
