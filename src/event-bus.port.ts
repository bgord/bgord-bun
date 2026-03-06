import type { Message, ToMessageMap } from "./message.types";

export interface EventBusPort<Event extends Message> {
  emit<EventName extends keyof ToMessageMap<Event>>(
    name: EventName,
    event: ToMessageMap<Event>[EventName],
  ): Promise<void>;

  on<EventName extends keyof ToMessageMap<Event>>(
    name: EventName,
    handler: (event: ToMessageMap<Event>[EventName]) => void | Promise<void>,
  ): void;
}
