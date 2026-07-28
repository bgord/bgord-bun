import type { StaticConfigPort } from "./static-config.port";

export class StaticConfigAdapter<T> implements StaticConfigPort<T> {
  constructor(private readonly value: T) {}

  get(): T {
    return this.value;
  }
}
