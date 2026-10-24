import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { EventHandlerBareStrategy } from "../src/handler-bare.strategy";
import { EventBusCollectingAdapter } from "../src/message-bus-collecting.adapter";
import type * as Auth from "../src/modules/auth";
import * as Preferences from "../src/modules/preferences";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const RemoteFileStorage = new RemoteFileStorageNoopAdapter({ root: mocks.temporaryDirectory }, { Clock });
const EventBus = new EventBusCollectingAdapter<Auth.Events.AccountDeletedEventType>();
const EventHandler = new EventHandlerBareStrategy();

describe("ProfileAvatarEraser", () => {
  test("happy path", async () => {
    using remoteFileStorageDelete = spyOn(RemoteFileStorage, "delete");
    const policy = new Preferences.Policies.ProfileAvatarEraser(mocks.ProfileAvatar, {
      EventBus,
      EventHandler,
      RemoteFileStorage,
    });

    await policy.onAccountDeletedEvent(mocks.GenericAccountDeletedEvent);

    expect(remoteFileStorageDelete).toHaveBeenCalledWith(mocks.profileAvatarObjectKey);
  });
});
