import Emittery from "emittery";
import type { EventBusPort } from "./event-bus.port";
import type { Message, ToMessageMap } from "./message.types";

export class EventBusEmitteryAdapter<Event extends Message> implements EventBusPort<Event> {
  private readonly emittery: Emittery<ToMessageMap<Event>>;

  constructor() {
    this.emittery = new Emittery<ToMessageMap<Event>>();
  }

  async emit<E extends Event>(event: E): Promise<void> {
    await this.emittery.emit(
      event.name as keyof ToMessageMap<Event>,
      event as ToMessageMap<Event>[keyof ToMessageMap<Event>],
    );
  }

  on<EventName extends keyof ToMessageMap<Event>>(
    name: EventName,
    handler: (event: ToMessageMap<Event>[EventName]) => void | Promise<void>,
  ): void {
    this.emittery.on(name, handler);
  }
}
