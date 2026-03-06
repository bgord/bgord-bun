import type { Message, ToMessageMap } from "./message.types";

export interface EventBusPort<Event extends Message> {
  emit<E extends Event>(event: E): Promise<void>;

  on<EventName extends keyof ToMessageMap<Event>>(
    name: EventName,
    handler: (event: ToMessageMap<Event>[EventName]) => void | Promise<void>,
  ): void;
}
