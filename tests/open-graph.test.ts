import { describe, expect, test } from "bun:test";

import {
  OpenGraphDescriptionValue,
  OpenGraphImageHeightValue,
  OpenGraphImageTypeValue,
  OpenGraphImageUrlValue,
  OpenGraphImageWidthValue,
  OpenGraphTitleValue,
  OpenGraphTypeValue,
  OpenGraphUrlValue,
} from "../src/open-graph";

describe("OpenGraphTitleValue", () => {
  test("passes with non-empty string", () => {
    expect(() => OpenGraphTitleValue.parse("Title")).not.toThrow();
  });

  test("fails with empty string", () => {
    expect(() => OpenGraphTitleValue.parse("")).toThrow();
  });
});

describe("OpenGraphDescriptionValue", () => {
  test("passes with non-empty string", () => {
    expect(() => OpenGraphDescriptionValue.parse("Description")).not.toThrow();
  });

  test("fails with empty string", () => {
    expect(() => OpenGraphDescriptionValue.parse("")).toThrow();
  });
});

describe("OpenGraphUrlValue", () => {
  test("passes with non-empty string", () => {
    expect(() => OpenGraphUrlValue.parse("https://example.com")).not.toThrow();
  });

  test("fails with empty string", () => {
    expect(() => OpenGraphUrlValue.parse("")).toThrow();
  });
});

describe("OpenGraphTypeValue", () => {
  test("passes with 'website'", () => {
    expect(() => OpenGraphTypeValue.parse("website")).not.toThrow();
  });

  test("passes with 'article'", () => {
    expect(() => OpenGraphTypeValue.parse("article")).not.toThrow();
  });

  test("fails with invalid type", () => {
    expect(() => OpenGraphTypeValue.parse("video")).toThrow();
  });
});

describe("OpenGraphImageUrlValue", () => {
  test("passes with valid URL", () => {
    expect(() => OpenGraphImageUrlValue.parse("https://example.com/image.jpg")).not.toThrow();
  });

  test("fails with invalid URL", () => {
    expect(() => OpenGraphImageUrlValue.parse("not-a-url")).toThrow();
  });
});

describe("OpenGraphImageTypeValue", () => {
  test("passes with non-empty string", () => {
    expect(() => OpenGraphImageTypeValue.parse("image/jpeg")).not.toThrow();
  });

  test("fails with empty string", () => {
    expect(() => OpenGraphImageTypeValue.parse("")).toThrow();
  });
});

describe("OpenGraphImageWidthValue", () => {
  test("passes with 1200", () => {
    expect(() => OpenGraphImageWidthValue.parse(1200)).not.toThrow();
  });

  test("fails with other values", () => {
    expect(() => OpenGraphImageWidthValue.parse(800)).toThrow("open.graph.image.width.invalid");
    expect(() => OpenGraphImageWidthValue.parse(0)).toThrow();
    expect(() => OpenGraphImageWidthValue.parse(-1200)).toThrow();
  });
});

describe("OpenGraphImageHeightValue", () => {
  test("passes with 630", () => {
    expect(() => OpenGraphImageHeightValue.parse(630)).not.toThrow();
  });

  test("fails with other values", () => {
    expect(() => OpenGraphImageHeightValue.parse(600)).toThrow("open.graph.image.height.invalid");
    expect(() => OpenGraphImageHeightValue.parse(0)).toThrow();
    expect(() => OpenGraphImageHeightValue.parse(-630)).toThrow();
  });
});
