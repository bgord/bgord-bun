import Emittery from "emittery";
import type { EventBusPort } from "./event-bus.port";
import type { Message } from "./message.types";
import type { ToEventMap } from "./to-event-map.types";

export class EventBusEmitteryV1Adapter<Event extends Message> implements EventBusPort<Event> {
  private readonly emittery: Emittery<ToEventMap<Event>>;

  constructor() {
    this.emittery = new Emittery<ToEventMap<Event>>();
  }

  async emit<EventName extends keyof ToEventMap<Event>>(
    name: EventName,
    event: ToEventMap<Event>[EventName],
  ): Promise<void> {
    await this.emittery.emit(name, event);
  }

  on<EventName extends keyof ToEventMap<Event>>(
    name: EventName,
    handler: (event: ToEventMap<Event>[EventName]) => void | Promise<void>,
  ): void {
    this.emittery.on(name, handler);
  }
}
