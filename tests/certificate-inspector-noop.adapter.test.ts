import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";
import { Hostname } from "../src/hostname.vo";

const hostname = v.parse(Hostname, "example.com");

const adapter = new CertificateInspectorNoopAdapter(tools.Duration.Days(30));

describe("CertificateInspectorNoopAdapter", () => {
  test("success", async () => {
    expect(await adapter.inspect(hostname)).toEqual({
      success: true,
      remaining: tools.Duration.Days(30),
    });
  });
});
