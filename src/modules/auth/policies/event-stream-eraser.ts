import type { EventStreamEraserPort } from "../../../event-stream-eraser.port";
import type { EventHandlerStrategy } from "../../../handler.strategy";
import type { EventBusPort } from "../../../message-bus.port";
import * as Events from "../events";

type Dependencies = {
  EventBus: EventBusPort<Events.AccountDeletedEventType>;
  EventHandler: EventHandlerStrategy;
  EventStreamEraser: EventStreamEraserPort;
};

export class EventStreamEraser {
  // Stryker disable all
  constructor(private readonly deps: Dependencies) {
    deps.EventBus.on(
      Events.ACCOUNT_DELETED_EVENT,
      deps.EventHandler.handle(this.onAccountDeletedEvent.bind(this)),
    );
  }
  // Stryker restore all

  async onAccountDeletedEvent(event: Events.AccountDeletedEventType) {
    await this.deps.EventStreamEraser.erase(event.payload.userId);
  }
}
