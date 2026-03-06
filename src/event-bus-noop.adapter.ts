import type { EventBusPort } from "./event-bus.port";
import type { Message } from "./message.types";
import type { ToEventMap } from "./to-event-map.types";

export class EventBusNoopAdapter<Event extends Message> implements EventBusPort<Event> {
  async emit<EventName extends keyof ToEventMap<Event>>(
    _name: EventName,
    _event: ToEventMap<Event>[EventName],
  ): Promise<void> {}

  on<EventName extends keyof ToEventMap<Event>>(
    _name: EventName,
    _handler: (event: ToEventMap<Event>[EventName]) => void | Promise<void>,
  ): void {}
}
