import Emittery from "emittery";
import type { Message, ToMessageMap } from "./message.types";
import type { MessageBusPort } from "./message-bus.port";

export class MessageBusEmitteryAdapter<Messages extends Message> implements MessageBusPort<Messages> {
  private readonly emittery: Emittery<ToMessageMap<Messages>>;

  constructor() {
    this.emittery = new Emittery<ToMessageMap<Messages>>();
  }

  async emit<E extends Messages>(message: E): Promise<void> {
    await this.emittery.emitSerial(
      message.name as keyof ToMessageMap<Messages>,
      message as ToMessageMap<Messages>[keyof ToMessageMap<Messages>],
    );
  }

  on<MessageName extends keyof ToMessageMap<Messages>>(
    name: MessageName,
    handler: (message: ToMessageMap<Messages>[MessageName]) => void | Promise<void>,
  ): void {
    this.emittery.on(name, ({ data }) => handler(data as ToMessageMap<Messages>[MessageName]));
  }
}

export const EventBusEmitteryAdapter = MessageBusEmitteryAdapter;
export const CommandBusEmitteryAdapter = MessageBusEmitteryAdapter;
