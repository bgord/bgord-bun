import { describe, expect, test } from "bun:test";
import { WebhookBodyBuilderSignedHeadersStrategy } from "../src/webhook-body-builder-signed-headers.strategy";
import { RequestContextBuilder } from "./request-context-builder";

describe("WebhookBodyBuilderSignedHeadersStrategy", () => {
  test("happy path", async () => {
    const context = new RequestContextBuilder()
      .withHeader("x-delivery-id", "delivery-1")
      .withText("raw-body")
      .build();

    expect(await new WebhookBodyBuilderSignedHeadersStrategy(["x-delivery-id"]).build(context)).toEqual(
      '[[["x-delivery-id","delivery-1"]],"raw-body"]',
    );
  });

  test("no headers configured", async () => {
    const context = new RequestContextBuilder().withText("raw-body").build();

    expect(await new WebhookBodyBuilderSignedHeadersStrategy([]).build(context)).toEqual('[[],"raw-body"]');
  });

  test("missing header", async () => {
    const context = new RequestContextBuilder().withText("raw-body").build();

    expect(await new WebhookBodyBuilderSignedHeadersStrategy(["x-delivery-id"]).build(context)).toEqual(
      '[[["x-delivery-id",null]],"raw-body"]',
    );
  });

  test("multiple headers keep the configured order", async () => {
    const context = new RequestContextBuilder()
      .withHeader("x-timestamp", "1700000000")
      .withHeader("x-delivery-id", "delivery-1")
      .withText("raw-body")
      .build();

    expect(
      await new WebhookBodyBuilderSignedHeadersStrategy(["x-delivery-id", "x-timestamp"]).build(context),
    ).toEqual('[[["x-delivery-id","delivery-1"],["x-timestamp","1700000000"]],"raw-body"]');
  });

  test("header value cannot be shifted into the body", async () => {
    const shifted = new RequestContextBuilder()
      .withHeader("x-delivery-id", 'delivery-1","raw-body')
      .withText("")
      .build();

    const original = new RequestContextBuilder()
      .withHeader("x-delivery-id", "delivery-1")
      .withText("raw-body")
      .build();

    const builder = new WebhookBodyBuilderSignedHeadersStrategy(["x-delivery-id"]);

    expect(await builder.build(shifted)).not.toEqual(await builder.build(original));
  });

  test("no body", async () => {
    const context = new RequestContextBuilder()
      .withHeader("x-delivery-id", "delivery-1")
      .withText("")
      .build();

    expect(await new WebhookBodyBuilderSignedHeadersStrategy(["x-delivery-id"]).build(context)).toEqual(
      '[[["x-delivery-id","delivery-1"]],""]',
    );
  });
});
