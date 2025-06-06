import { describe, expect, test } from "bun:test";

import {
  OpenGraph,
  OpenGraphDescriptionValue,
  OpenGraphImage,
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

describe("OpenGraphTitle", () => {
  test("toMetatag and toMeta output correct markup", () => {
    const title = new OpenGraph.title("Test Title");
    expect(title.toMetatag()).toBe('<meta property="og:title" content="Test Title" />');
    expect(title.toMeta()).toBe('<meta property="og:title" content="Test Title" />\n\t');
  });
});

describe("OpenGraphDescription", () => {
  test("toMetatag and toMeta output correct markup", () => {
    const desc = new OpenGraph.description("Test Description");
    expect(desc.toMetatag()).toBe('<meta property="og:description" content="Test Description" />');
    expect(desc.toMeta()).toBe('<meta property="og:description" content="Test Description" />\n\t');
  });
});

describe("OpenGraphUrl", () => {
  test("toMetatag and toMeta output correct markup", () => {
    const url = new OpenGraph.url("https://example.com");
    expect(url.toMetatag()).toBe('<meta property="og:url" content="https://example.com" />');
    expect(url.toMeta()).toBe('<meta property="og:url" content="https://example.com" />\n\t');
  });
});

describe("OpenGraphType", () => {
  test("toMetatag and toMeta output correct markup", () => {
    const type = new OpenGraph.type("website");
    expect(type.toMetatag()).toBe('<meta property="og:type" content="website" />');
    expect(type.toMeta()).toBe('<meta property="og:type" content="website" />\n\t');
  });
});

describe("OpenGraphImage components", () => {
  test("toMetatag and toMeta for image.url", () => {
    const url = new OpenGraph.image.url("https://example.com/image.jpg");
    expect(url.toMetatag()).toBe('<meta property="og:image" content="https://example.com/image.jpg" />');
    expect(url.toMeta()).toBe('<meta property="og:image" content="https://example.com/image.jpg" />\n\t');
  });

  test("toMetatag and toMeta for image.type", () => {
    const type = new OpenGraph.image.type("image/jpeg");
    expect(type.toMetatag()).toBe('<meta property="og:image:type" content="image/jpeg" />');
    expect(type.toMeta()).toBe('<meta property="og:image:type" content="image/jpeg" />\n\t');
  });

  test("toMetatag and toMeta for image.width", () => {
    const width = new OpenGraph.image.width(1200);
    expect(width.toMetatag()).toBe('<meta property="og:image:width" content="1200" />');
    expect(width.toMeta()).toBe('<meta property="og:image:width" content="1200" />\n\t');
  });

  test("toMetatag and toMeta for image.height", () => {
    const height = new OpenGraph.image.height(630);
    expect(height.toMetatag()).toBe('<meta property="og:image:height" content="630" />');
    expect(height.toMeta()).toBe('<meta property="og:image:height" content="630" />\n\t');
  });
});

describe("OpenGraphGenerator.toString", () => {
  test("returns full metatag string without image", () => {
    const config = {
      title: new OpenGraph.title("Title"),
      description: new OpenGraph.description("Description"),
      url: new OpenGraph.url("https://example.com"),
      type: new OpenGraph.type("website"),
    };

    const result = OpenGraph.generator.toString(config);
    const expected =
      '<meta property="og:title" content="Title" />\n\t' +
      '<meta property="og:description" content="Description" />\n\t' +
      '<meta property="og:url" content="https://example.com" />\n\t' +
      '<meta property="og:type" content="website" />\n\t';

    expect(result).toBe(expected);
  });

  test("returns full metatag string with image", () => {
    const image = new OpenGraph.image.url("https://example.com/image.jpg");
    const width = new OpenGraph.image.width(1200);
    const height = new OpenGraph.image.height(630);
    const type = new OpenGraph.image.type("image/jpeg");

    const config = {
      title: new OpenGraph.title("Title"),
      description: new OpenGraph.description("Description"),
      url: new OpenGraph.url("https://example.com"),
      type: new OpenGraph.type("article"),
      image: new OpenGraphImage({
        url: image,
        width,
        height,
        type,
      }),
    };

    const result = OpenGraph.generator.toString(config);

    const expected =
      '<meta property="og:title" content="Title" />\n\t' +
      '<meta property="og:description" content="Description" />\n\t' +
      '<meta property="og:url" content="https://example.com" />\n\t' +
      '<meta property="og:type" content="article" />\n\t' +
      '<meta property="og:image" content="https://example.com/image.jpg" />\n\t' +
      '<meta property="og:image:width" content="1200" />\n\t' +
      '<meta property="og:image:height" content="630" />\n\t' +
      '<meta property="og:image:type" content="image/jpeg" />\n\t';

    expect(result).toBe(expected);
  });
});
