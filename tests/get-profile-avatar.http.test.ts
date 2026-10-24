import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import * as Preferences from "../src/modules/preferences";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const RemoteFileStorage = new RemoteFileStorageNoopAdapter({ root: mocks.temporaryDirectory }, { Clock });
const endpoint = Preferences.HTTP.GetProfileAvatar(mocks.ProfileAvatar, { RemoteFileStorage });

describe("Preferences.HTTP.GetProfileAvatar", () => {
  test("validation - unauthenticated", async () => {
    const context = new RequestContextBuilder().build();

    expect(async () => endpoint(context)).toThrow("shield.auth.rejected");
  });

  test("no object", async () => {
    using remoteFileStorageHead = spyOn(RemoteFileStorage, "head");
    const context = new RequestContextBuilder().withUserId(mocks.userId).build();

    const response = await endpoint(context);

    expect(response.status).toEqual(404);
    expect(remoteFileStorageHead).toHaveBeenCalledWith(mocks.profileAvatarObjectKey);
  });

  test("304", async () => {
    using remoteFileStorageGetStream = spyOn(RemoteFileStorage, "getStream");
    using _ = spyOn(RemoteFileStorage, "head").mockResolvedValue(mocks.profileAvatarHead);
    const context = new RequestContextBuilder()
      .withUserId(mocks.userId)
      .withHeader("if-none-match", mocks.hashValue)
      .build();

    const response = await endpoint(context);

    expect(response.status).toEqual(304);
    expect(remoteFileStorageGetStream).not.toHaveBeenCalled();
  });

  test("stream unavailable", async () => {
    using _ = spyOn(RemoteFileStorage, "head").mockResolvedValue(mocks.profileAvatarHead);
    const context = new RequestContextBuilder().withUserId(mocks.userId).build();

    const response = await endpoint(context);

    expect(response.status).toEqual(404);
  });

  test("happy path", async () => {
    using spies = new DisposableStack();
    spies.use(spyOn(RemoteFileStorage, "head").mockResolvedValue(mocks.profileAvatarHead));
    spies.use(spyOn(RemoteFileStorage, "getStream").mockResolvedValue(mocks.stringToStream("abc")));
    const context = new RequestContextBuilder().withUserId(mocks.userId).build();

    const response = await endpoint(context);

    expect(response.status).toEqual(200);
    expect(response.headers.get("Content-Type")).toEqual("image/webp");
    expect(response.headers.get("ETag")).toEqual(mocks.hashValue);
    expect(await response.text()).toEqual("abc");
  });
});
