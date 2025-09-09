import { describe, expect, test } from "bun:test";
import { Port } from "../src/port.vo";
import { PrerequisitePort } from "../src/prerequisites/port";
import * as prereqs from "../src/prerequisites.service";

const PORT = Port.parse(43210);

describe("prerequisites - port", () => {
  test("passes if port is available", async () => {
    const prerequisite = new PrerequisitePort({ port: PORT, label: "PORT_AVAILABLE" });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.success());
  });

  test("fails if port is in use", async () => {
    const occupied = Bun.listen({ hostname: "::", port: PORT, socket: { data() {} } });
    const prerequisite = new PrerequisitePort({ port: PORT, label: "PORT_UNAVAILABLE" });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.failure());
    occupied.stop();
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisitePort({ port: PORT, label: "PORT_DISABLED", enabled: false });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
