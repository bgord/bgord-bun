import type * as tools from "@bgord/tools";
import { TimeoutError } from "./timeout-runner.port";

export class Timeout {
  static async cancellable<T>(
    action: (signal: AbortSignal) => Promise<T>,
    timeout: tools.Duration,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const controller = new AbortController();

      const reason = new Error(TimeoutError.Exceeded);

      const canceller = setTimeout(() => {
        controller.abort(reason);
        reject(reason);
      }, timeout.ms);

      // Promise.resolve.then used to prevent the initial action(controller.signal) call
      // from throwing before the resulting work-promise is run by promise.then.
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
