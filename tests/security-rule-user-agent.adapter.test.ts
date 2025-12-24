import { describe, expect, test } from "bun:test";
import { SecurityRuleUserAgentAdapter } from "../src/security-rule-user-agent.adapter";
import * as mocks from "./mocks";

const allowed = "known";
const forbidden = "anon";
const rule = new SecurityRuleUserAgentAdapter([forbidden]);

describe("SecurityRuleUserAgentAdapter", () => {
  test("isViolated - true", async () => {
    const context = { env: mocks.ip, req: { raw: {}, header: () => forbidden } } as any;

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false", async () => {
    const context = { env: mocks.ip, req: { raw: {}, header: () => allowed } } as any;

    expect(await rule.isViolated(context)).toEqual(false);
  });
});
