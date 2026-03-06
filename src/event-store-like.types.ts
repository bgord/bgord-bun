import type { Message } from "./message.types";

export type EventStoreLike<Event extends Message> = {
  save(events: ReadonlyArray<Event>): Promise<unknown>;
};
