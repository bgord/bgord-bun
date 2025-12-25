import { describe, expect, test } from "bun:test";
import { PrerequisiteSelf } from "../src/prerequisites/self";
import * as mocks from "./mocks";

describe("PrerequisiteSelf", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteSelf({ label: "self" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });
});
