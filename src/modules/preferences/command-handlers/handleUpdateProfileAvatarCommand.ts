import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ClockPort } from "../../../clock.port";
import type { CommitShaValueType } from "../../../commit-sha-value.vo";
import { event } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { ImageInfoPort } from "../../../image-info.port";
import type { ImageProcessorPort } from "../../../image-processor.port";
import type { RemoteFileStoragePort } from "../../../remote-file-storage.port";
import type { StaticConfigPort } from "../../../static-config.port";
import type { TemporaryFilePort } from "../../../temporary-file.port";
import type * as Commands from "../commands";
import * as Events from "../events";
import * as Invariants from "../invariants";
import type * as VO from "../value-objects";

type Dependencies = {
  EventStore: EventStorePort<AcceptedEvent>;
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  CommitConfig: StaticConfigPort<CommitShaValueType>;
  ImageInfo: ImageInfoPort;
  ImageProcessor: ImageProcessorPort;
  TemporaryFile: TemporaryFilePort;
  RemoteFileStorage: RemoteFileStoragePort;
};

type AcceptedEvent = Events.ProfileAvatarUpdatedEventType;

export const handleUpdateProfileAvatarCommand =
  (ProfileAvatar: VO.ProfileAvatarType, deps: Dependencies) =>
  async (command: Commands.UpdateProfileAvatarCommandType) => {
    const extension = v.parse(tools.Extension, "webp");
    const temporary = tools.FilePathAbsolute.fromString(command.payload.absoluteFilePath);

    const info = await deps.ImageInfo.inspect(temporary);

    if (!Invariants.ProfileAvatarConstraints.passes({ info, ProfileAvatar })) {
      await deps.TemporaryFile.cleanup(temporary.getFilename());
      throw new Invariants.ProfileAvatarConstraints.error();
    }

    const final = await deps.ImageProcessor.process({
      strategy: "in_place",
      input: temporary,
      to: extension,
      maxSide: ProfileAvatar.Side,
    });

    const key = ProfileAvatar.key(command.payload.userId);
    const object = await deps.RemoteFileStorage.putFromPath({ key, path: final });
    await deps.TemporaryFile.cleanup(final.getFilename());

    await deps.EventStore.save([
      event(
        Events.ProfileAvatarUpdatedEvent,
        `preferences_${command.payload.userId}`,
        { userId: command.payload.userId, key, etag: object.etag.get() },
        deps,
      ),
    ]);
  };
