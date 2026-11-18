export type Handleable = { name: string };

export interface HandlerStrategy {
  handle<H extends Handleable>(handler: (handleable: H) => Promise<void>): (handleable: H) => Promise<void>;
}

export type EventHandlerStrategy = HandlerStrategy;
export type CommandHandlerStrategy = HandlerStrategy;
export type JobHandlerStrategy = HandlerStrategy;
