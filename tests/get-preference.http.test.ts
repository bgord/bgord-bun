import { describe, expect, spyOn, test } from "bun:test";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const endpoint = Preferences.HTTP.GetPreference(mocks.NotificationPreference, {
  PreferenceReader: mocks.PreferenceReader,
});

describe("Preferences.HTTP.GetPreference", () => {
  test("validation - unauthenticated", async () => {
    const context = new RequestContextBuilder().build();

    expect(async () => endpoint(context)).toThrow("shield.auth.rejected");
  });

  test("default", async () => {
    const context = new RequestContextBuilder().withUserId(mocks.userId).build();

    const response = await endpoint(context);

    expect(await response.json()).toEqual({ notification: "on" });
  });

  test("happy path", async () => {
    using _ = spyOn(mocks.PreferenceReader, "get").mockResolvedValue("off");
    const context = new RequestContextBuilder().withUserId(mocks.userId).build();

    const response = await endpoint(context);

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({ notification: "off" });
  });
});
