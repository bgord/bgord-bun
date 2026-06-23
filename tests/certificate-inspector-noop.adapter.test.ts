import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";
import * as mocks from "./mocks";

const adapter = new CertificateInspectorNoopAdapter(tools.Duration.Days(30));

describe("CertificateInspectorNoopAdapter", () => {
  test("success", async () => {
    expect(await adapter.inspect(mocks.hostname)).toEqual({
      success: true,
      remaining: tools.Duration.Days(30),
    });
  });
});
