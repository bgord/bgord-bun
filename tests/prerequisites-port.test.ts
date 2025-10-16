import { describe, expect, test } from "bun:test";
import { Port } from "../src/port.vo";
import { PrerequisitePort } from "../src/prerequisites/port";
import * as prereqs from "../src/prerequisites.service";

const port = Port.parse(43210);

describe("PrerequisitePort", () => {
  test("success", async () => {
    expect(await new PrerequisitePort({ port, label: "port" }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure", async () => {
    const occupied = Bun.listen({ hostname: "::", port, socket: { data() {} } });

    expect(await new PrerequisitePort({ port, label: "port" }).verify()).toEqual(
      prereqs.Verification.failure(),
    );

    occupied.stop();
  });

  test("undetermined", async () => {
    expect(await new PrerequisitePort({ port, label: "port", enabled: false }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
