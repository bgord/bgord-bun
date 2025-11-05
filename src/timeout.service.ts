import type * as tools from "@bgord/tools";

export const TimeoutError = { Exceeded: "timeout.exceeded" };

export class Timeout {
  static run<T>(action: Promise<T>, duration: tools.Duration): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const reason = new Error(TimeoutError.Exceeded);

      const canceller = setTimeout(() => reject(reason), duration.ms);

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

  static cancellable<T>(action: (signal: AbortSignal) => Promise<T>, duration: tools.Duration): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const controller = new AbortController();

      const reason = new Error(TimeoutError.Exceeded);

      const canceller = setTimeout(() => {
        controller.abort(reason);
        reject(reason);
      }, duration.ms);

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
