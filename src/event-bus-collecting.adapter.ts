import type { EventBusPort } from "./event-bus.port";
import type { Message, ToMessageMap } from "./message.types";

export class EventBusCollectingAdapter<Event extends Message> implements EventBusPort<Event> {
  public events: Array<Event> = [];

  async emit<E extends Event>(event: E): Promise<void> {
    this.events.push(event);
  }

  on<EventName extends keyof ToMessageMap<Event>>(
    _name: EventName,
    _handler: (event: ToMessageMap<Event>[EventName]) => void | Promise<void>,
  ): void {}
}
