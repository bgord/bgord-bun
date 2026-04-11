import { describe, expect, test } from "bun:test";
import { WebhookBodyBuilderTextStrategy } from "../src/webhook-body-builder-text.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const builder = new WebhookBodyBuilderTextStrategy();

describe("WebhookBodyBuilderTextStrategy", () => {
  test("happy path", async () => {
    const context = new RequestContextBuilder().withText("raw-body").build();

    expect(await builder.build(context)).toEqual("raw-body");
  });

  test("no body", async () => {
    const context = new RequestContextBuilder().withText("").build();

    expect(await builder.build(context)).toEqual("");
  });
});
