import { describe, expect, test } from "bun:test";
import { SecurityRuleHoneyPotFieldStrategy } from "../src/security-rule-honey-pot-field.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import * as mocks from "./mocks";

const field = "reference";
const rule = new SecurityRuleHoneyPotFieldStrategy(field);

const createContext = (value: Function) => ({ req: { raw: { clone: () => ({ json: value }) } } }) as any;

describe("SecurityRuleHoneyPotFieldStrategy", () => {
  test("isViolated - true", async () => {
    const context = createContext(async () => ({ [field]: "abc" }));

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false - missing field", async () => {
    const context = createContext(async () => ({}));

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - false - missing string", async () => {
    const context = createContext(async () => ({ [field]: "" }));

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - false - null", async () => {
    const context = createContext(async () => ({ [field]: null }));

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - false - undefined", async () => {
    const context = createContext(async () => ({ [field]: undefined }));

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - false - throw error", async () => {
    const context = createContext(mocks.throwIntentionalErrorAsync);

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("honey_pot_field"));
  });
});
