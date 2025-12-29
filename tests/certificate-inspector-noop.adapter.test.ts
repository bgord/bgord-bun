import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";

const adapter = new CertificateInspectorNoopAdapter(tools.Duration.Days(30));

describe("CertificateInspectorNoopAdapter", () => {
  test("success", async () => {
    expect(await adapter.inspect("example.com")).toEqual({
      success: true,
      remaining: tools.Duration.Days(30),
    });
  });
});
