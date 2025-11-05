import type * as tools from "@bgord/tools";

export const TimeoutError = { Exceeded: "timeout.exceeded" };

export class Timeout {
  static run<T>(action: Promise<T>, duration: tools.Duration): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(TimeoutError.Exceeded)), duration.ms);

      action.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });
  }

  static cancellable<T>(action: (signal: AbortSignal) => Promise<T>, duration: tools.Duration): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const controller = new AbortController();

      const timer = setTimeout(() => {
        controller.abort(new Error(TimeoutError.Exceeded));
        reject(new Error(TimeoutError.Exceeded));
      }, duration.ms);

      action(controller.signal).then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });
  }
}
