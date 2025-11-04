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
}
