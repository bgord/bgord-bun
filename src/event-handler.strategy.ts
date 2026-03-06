export interface EventHandlerStrategy {
  handle<T extends { name: string }>(fn: (event: T) => Promise<void>): (event: T) => Promise<void>;
}
