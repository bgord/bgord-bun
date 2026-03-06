import type { EventBusPort } from "./event-bus.port";
import type { Message, ToMessageMap } from "./message.types";

export class EventBusCollectingAdapter<Event extends Message> implements EventBusPort<Event> {
  public events: Array<Event> = [];

  async emit<EventName extends keyof ToMessageMap<Event>>(
    _name: EventName,
    event: ToMessageMap<Event>[EventName],
  ): Promise<void> {
    this.events.push(event as Event);
  }

  on<EventName extends keyof ToMessageMap<Event>>(
    _name: EventName,
    _handler: (event: ToMessageMap<Event>[EventName]) => void | Promise<void>,
  ): void {}
}
