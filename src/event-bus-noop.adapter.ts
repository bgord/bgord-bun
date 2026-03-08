import type { Message, ToMessageMap } from "./message.types";
import type { EventBusPort } from "./message-bus.port";

export class EventBusNoopAdapter<Event extends Message> implements EventBusPort<Event> {
  async emit<E extends Event>(_event: E): Promise<void> {}

  on<EventName extends keyof ToMessageMap<Event>>(
    _name: EventName,
    _handler: (event: ToMessageMap<Event>[EventName]) => void | Promise<void>,
  ): void {}
}
