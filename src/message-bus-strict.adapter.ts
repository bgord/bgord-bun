import type { Message, ToMessageMap } from "./message.types";
import type { MessageBusPort } from "./message-bus.port";

export const MessageBusStrictAdapterError = {
  NoHandler: "message.bus.strict.adapter.no.handler",
  DuplicateHandler: "message.bus.strict.adapter.duplicate.handler",
};

type Dependencies<Messages extends Message> = { inner: MessageBusPort<Messages> };

export class MessageBusStrictAdapter<Messages extends Message> implements MessageBusPort<Messages> {
  private readonly registered = new Set<PropertyKey>();

  constructor(private readonly deps: Dependencies<Messages>) {}

  async emit<M extends Messages>(message: M): Promise<void> {
    if (!this.registered.has(message.name)) throw new Error(MessageBusStrictAdapterError.NoHandler);

    await this.deps.inner.emit(message);
  }

  on<MessageName extends keyof ToMessageMap<Messages>>(
    name: MessageName,
    handler: (message: ToMessageMap<Messages>[MessageName]) => void | Promise<void>,
  ): void {
    if (this.registered.has(name)) throw new Error(MessageBusStrictAdapterError.DuplicateHandler);

    this.registered.add(name);
    this.deps.inner.on(name, handler);
  }
}

export const CommandBusStrictAdapter = MessageBusStrictAdapter;
