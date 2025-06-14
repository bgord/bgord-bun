import { describe, expect, test } from "bun:test";

import { Port } from "../src/port.vo";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import { PrerequisitePort } from "../src/prerequisites/port";

const PORT = Port.parse(43210);

describe("prerequisites - port", () => {
  test("passes if port is available", async () => {
    const prerequisite = new PrerequisitePort({
      port: PORT,
      label: "PORT_AVAILABLE",
      enabled: true,
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.success);
  });

  test("fails if port is in use", async () => {
    const occupied = Bun.listen({
      hostname: "::", // covers all IPv6 + mapped IPv4
      port: PORT,
      socket: {
        data() {},
      },
    });

    const prerequisite = new PrerequisitePort({
      port: PORT,
      label: "PORT_UNAVAILABLE",
      enabled: true,
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);

    occupied.stop();
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisitePort({
      port: PORT,
      label: "PORT_DISABLED",
      enabled: false,
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
