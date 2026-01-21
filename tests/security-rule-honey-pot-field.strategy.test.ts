import { describe, expect, spyOn, test } from "bun:test";
import { SecurityRuleHoneyPotFieldStrategy } from "../src/security-rule-honey-pot-field.strategy";
import { SecurityRuleName } from "../src/security-rule-name.vo";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const field = "reference";
const rule = new SecurityRuleHoneyPotFieldStrategy(field);

describe("SecurityRuleHoneyPotFieldStrategy", () => {
  test("isViolated - true", async () => {
    const context = new RequestContextBuilder().withJson({ [field]: "abc" }).build();

    expect(await rule.isViolated(context)).toEqual(true);
  });

  test("isViolated - false - missing field", async () => {
    const context = new RequestContextBuilder().withJson({}).build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - false - missing string", async () => {
    const context = new RequestContextBuilder().withJson({ [field]: "" }).build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - false - null", async () => {
    const context = new RequestContextBuilder().withJson({ [field]: null }).build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("isViolated - false - undefined", async () => {
    const context = new RequestContextBuilder().withJson({ [field]: undefined }).build();

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test.todo("isViolated - false - throw error", async () => {
    const context = new RequestContextBuilder().build();
    spyOn(context.request, "json").mockImplementation(mocks.throwIntentionalError);

    expect(await rule.isViolated(context)).toEqual(false);
  });

  test("name", () => {
    expect(rule.name).toEqual(SecurityRuleName.parse("honey_pot_field"));
  });
});
