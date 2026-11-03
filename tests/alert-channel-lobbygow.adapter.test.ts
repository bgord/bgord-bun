import { describe, expect, spyOn, test } from "bun:test";
import { AlertChannelLobbygowAdapter } from "../src/alert-channel-lobbygow.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.alertChannel();

const adapter = new AlertChannelLobbygowAdapter({
  API_KEY: mocks.apiKey,
  message: () => cases.subjects.template.message,
});

describe("AlertChannelLobbygowAdapter", () => {
  test(cases.send.name, async () => {
    using fetch = spyOn(global, "fetch").mockResolvedValue(new Response(null));

    await adapter.send(cases.send.input);

    expect(fetch).toHaveBeenCalledWith("https://lobbygow.bgord.space/api/notification-send", {
      method: "POST",
      headers: { "content-type": "application/json", "api-key": mocks.apiKey },
      body: JSON.stringify({
        kind: "error",
        subject: cases.subjects.template.message.subject,
        content: cases.subjects.template.message.html,
      }),
    });
  });

  test("send - rejected", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 500 }));

    expect(async () => adapter.send(cases.send.input)).toThrow("alert.channel.lobbygow.adapter.rejected");
  });

  test("send - network error", async () => {
    using _ = spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));

    expect(async () => adapter.send(cases.send.input)).toThrow(mocks.IntentionalError);
  });

  test(cases.verify.name, async () => {
    using fetch = spyOn(global, "fetch").mockResolvedValue(new Response(null));

    const result = await adapter.verify();

    expect(result).toEqual(cases.verify.output);
    expect(fetch).toHaveBeenCalledWith("https://lobbygow.bgord.space/api/liveness");
  });

  test("verify - not ok", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 500 }));

    const result = await adapter.verify();

    expect(result).toEqual(false);
  });

  test("verify - network error", async () => {
    using _ = spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));

    const result = await adapter.verify();

    expect(result).toEqual(false);
  });
});
