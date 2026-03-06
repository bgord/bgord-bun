import Emittery from "emittery";
import type { EventBusPort } from "./event-bus.port";
import type { Message, ToMessageMap } from "./message.types";

export class EventBusEmitteryV1Adapter<Event extends Message> implements EventBusPort<Event> {
  private readonly emittery: Emittery<ToMessageMap<Event>>;

  constructor() {
    this.emittery = new Emittery<ToMessageMap<Event>>();
  }

  async emit<EventName extends keyof ToMessageMap<Event>>(
    name: EventName,
    event: ToMessageMap<Event>[EventName],
  ): Promise<void> {
    await this.emittery.emit(name, event);
  }

  on<EventName extends keyof ToMessageMap<Event>>(
    name: EventName,
    handler: (event: ToMessageMap<Event>[EventName]) => void | Promise<void>,
  ): void {
    this.emittery.on(name, handler);
  }
}
