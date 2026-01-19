import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierMemoryAdapter } from "../src/prerequisite-verifier-memory.adapter";

const maximum = tools.Size.fromMB(2);

const prerequisite = new PrerequisiteVerifierMemoryAdapter({ maximum });

const memoryUsage = { heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 };

describe("PrerequisiteVerifierMemoryAdapter", () => {
  test("success", async () => {
    spyOn(process, "memoryUsage").mockReturnValue({ ...memoryUsage, rss: tools.Size.fromMB(1).toBytes() });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - memory usage exceeds the maximum", async () => {
    const memoryConsumption = tools.Size.fromMB(3);
    spyOn(process, "memoryUsage").mockReturnValue({ ...memoryUsage, rss: memoryConsumption.toBytes() });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure(`Memory consumption: ${memoryConsumption.format(tools.Size.unit.MB)}`),
    );
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("memory");
  });
});
