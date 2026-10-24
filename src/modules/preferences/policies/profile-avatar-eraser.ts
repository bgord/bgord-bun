import type { EventHandlerStrategy } from "../../../handler.strategy";
import type { EventBusPort } from "../../../message-bus.port";
import type { RemoteFileStoragePort } from "../../../remote-file-storage.port";
import * as Auth from "../../auth";
import type * as VO from "../value-objects";

type Dependencies = {
  EventBus: EventBusPort<Auth.Events.AccountDeletedEventType>;
  EventHandler: EventHandlerStrategy;
  RemoteFileStorage: RemoteFileStoragePort;
};

export class ProfileAvatarEraser {
  // Stryker disable all
  constructor(
    private readonly ProfileAvatar: VO.ProfileAvatarType,
    private readonly deps: Dependencies,
  ) {
    deps.EventBus.on(
      Auth.Events.ACCOUNT_DELETED_EVENT,
      deps.EventHandler.handle(this.onAccountDeletedEvent.bind(this)),
    );
  }
  // Stryker restore all

  async onAccountDeletedEvent(event: Auth.Events.AccountDeletedEventType) {
    await this.deps.RemoteFileStorage.delete(this.ProfileAvatar.key(event.payload.userId));
  }
}
