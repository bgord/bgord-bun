import type { ClockPort } from "../../../clock.port";
import type { CommitShaValueType } from "../../../commit-sha-value.vo";
import { event } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { RemoteFileStoragePort } from "../../../remote-file-storage.port";
import type { StaticConfigPort } from "../../../static-config.port";
import type * as Commands from "../commands";
import * as Events from "../events";
import type * as VO from "../value-objects";

type Dependencies = {
  EventStore: EventStorePort<AcceptedEvent>;
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  CommitConfig: StaticConfigPort<CommitShaValueType>;
  RemoteFileStorage: RemoteFileStoragePort;
};

type AcceptedEvent = Events.ProfileAvatarRemovedEventType;

export const handleRemoveProfileAvatarCommand =
  (ProfileAvatar: VO.ProfileAvatarType, deps: Dependencies) =>
  async (command: Commands.RemoveProfileAvatarCommandType) => {
    await deps.RemoteFileStorage.delete(ProfileAvatar.key(command.payload.userId));

    await deps.EventStore.save([
      event(
        Events.ProfileAvatarRemovedEvent,
        `preferences_${command.payload.userId}`,
        { userId: command.payload.userId },
        deps,
      ),
    ]);
  };
