import { describe, expect, spyOn, test } from "bun:test";
import { TimekeeperGoogleAdapter } from "../src/timekeeper-google.adapter";
import * as mocks from "./mocks";

const adapter = new TimekeeperGoogleAdapter();

describe("TimekeeperGoogleAdapter", () => {
  test("happy path", async () => {
    spyOn(global, "fetch").mockResolvedValue(
      new Response(null, { headers: { date: mocks.TIME_ZERO_DATE_UTC } }),
    );

    expect(await adapter.get()).toEqual(mocks.TIME_ZERO);
  });

  test("response not ok", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 500 }));

    expect(await adapter.get()).toEqual(null);
  });

  test("missing date header", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(null));

    expect(await adapter.get()).toEqual(null);
  });

  test("invalid date header", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(null, { headers: { date: "xxx" } }));

    expect(await adapter.get()).toEqual(null);
  });

  test("error", async () => {
    spyOn(global, "fetch").mockRejectedValue(mocks.IntentionalError);

    expect(await adapter.get()).toEqual(null);
  });
});
