import { describe, expect, test } from "bun:test";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";

const adapter = new CertificateInspectorNoopAdapter(30);

describe("CertificateInspectorNoopAdapter", () => {
  test("success", async () => {
    expect(await adapter.inspect("example.com")).toEqual({ success: true, remaining: 30 });
  });
});
