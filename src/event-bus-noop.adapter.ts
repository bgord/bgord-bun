import type { EventBusPort } from "./event-bus.port";
import type { Message, ToMessageMap } from "./message.types";

export class EventBusNoopAdapter<Event extends Message> implements EventBusPort<Event> {
  async emit<EventName extends keyof ToMessageMap<Event>>(
    _name: EventName,
    _event: ToMessageMap<Event>[EventName],
  ): Promise<void> {}

  on<EventName extends keyof ToMessageMap<Event>>(
    _name: EventName,
    _handler: (event: ToMessageMap<Event>[EventName]) => void | Promise<void>,
  ): void {}
}
