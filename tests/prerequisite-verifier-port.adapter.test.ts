import { describe, expect, test } from "bun:test";
import { Port } from "../src/port.vo";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierPortAdapter } from "../src/prerequisite-verifier-port.adapter";

const port = Port.parse(43210);

const prerequisite = new PrerequisiteVerifierPortAdapter({ port });

describe("PrerequisiteVerifierPortAdapter", () => {
  test("success", async () => {
    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    const occupied = Bun.listen({ hostname: "::", port, socket: { data() {} } });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure());

    occupied.stop();
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("port");
  });
});
