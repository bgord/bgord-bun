import type { EventBusPort } from "./event-bus.port";
import type { Message } from "./message.types";
import type { ToEventMap } from "./to-event-map.types";

export class EventBusCollectingAdapter<Event extends Message> implements EventBusPort<Event> {
  public events: Array<Event> = [];

  async emit<EventName extends keyof ToEventMap<Event>>(
    _name: EventName,
    event: ToEventMap<Event>[EventName],
  ): Promise<void> {
    this.events.push(event as Event);
  }

  on<EventName extends keyof ToEventMap<Event>>(
    _name: EventName,
    _handler: (event: ToEventMap<Event>[EventName]) => void | Promise<void>,
  ): void {}
}
