import type { Message } from "./message.types";
import type { ToEventMap } from "./to-event-map.types";

export interface EventBusPort<Event extends Message> {
  emit<EventName extends keyof ToEventMap<Event>>(
    name: EventName,
    event: ToEventMap<Event>[EventName],
  ): Promise<void>;

  on<EventName extends keyof ToEventMap<Event>>(
    name: EventName,
    handler: (event: ToEventMap<Event>[EventName]) => void | Promise<void>,
  ): void;
}
