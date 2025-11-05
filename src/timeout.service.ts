import type * as tools from "@bgord/tools";
import type { LoggerPort } from "../src/logger.port";

export const TimeoutError = { Exceeded: "timeout.exceeded" };

export class Timeout {
  static async run<T>(action: Promise<T>, timeout: tools.Duration): Promise<T> {
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

  static async monitor<T>(action: Promise<T>, timeout: tools.Duration, logger: LoggerPort): Promise<T> {
    const monitor = setTimeout(
      () =>
        logger.warn({
          message: "Timeout",
          component: "infra",
          operation: "timeout_monitor",
          metadata: { timeoutMs: timeout.ms },
        }),
      timeout.ms,
    );

    return action.finally(() => clearTimeout(monitor));
  }

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
