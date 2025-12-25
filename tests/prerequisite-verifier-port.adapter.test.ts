import { describe, expect, test } from "bun:test";
import { Port } from "../src/port.vo";
import { PrerequisiteVerifierPortAdapter } from "../src/prerequisite-verifier-port.adapter";
import * as mocks from "./mocks";

const port = Port.parse(43210);

describe("PrerequisiteVerifierPortAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierPortAdapter({ port, label: "port" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const occupied = Bun.listen({ hostname: "::", port, socket: { data() {} } });
    const prerequisite = new PrerequisiteVerifierPortAdapter({ port, label: "port" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure());

    occupied.stop();
  });
});
