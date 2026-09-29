import { describe, expect, spyOn, test } from "bun:test";
import { MarkdownGeneratorAdapter } from "../src/markdown-generator.adapter";

describe("MarkdownGeneratorAdapter", () => {
  test("generate", () => {
    using bunMarkdown = spyOn(Bun.markdown, "html");
    const adapter = new MarkdownGeneratorAdapter();
    const template = "# Example";

    expect(adapter.generate(template)).toEqualIgnoringWhitespace("<h1>Example</h1>");
    expect(bunMarkdown).toHaveBeenCalledWith(template, {
      tagFilter: true,
      noHtmlBlocks: true,
      noHtmlSpans: true,
    });
  });

  test("generate - escapes raw html", () => {
    const adapter = new MarkdownGeneratorAdapter();

    expect(adapter.generate("<script>alert(1)</script>")).toEqualIgnoringWhitespace(
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
    );
    expect(adapter.generate("<img src=x onerror=alert(2)>")).toEqualIgnoringWhitespace(
      "<p>&lt;img src=x onerror=alert(2)&gt;</p>",
    );
  });

  test("generate - allowed links", () => {
    const adapter = new MarkdownGeneratorAdapter();

    expect(adapter.generate("[a](https://example.com)")).toEqualIgnoringWhitespace(
      '<p><a href="https://example.com">a</a></p>',
    );
    expect(adapter.generate("[a](http://example.com)")).toEqualIgnoringWhitespace(
      '<p><a href="http://example.com">a</a></p>',
    );
    expect(adapter.generate("[a](mailto:user@example.com)")).toEqualIgnoringWhitespace(
      '<p><a href="mailto:user@example.com">a</a></p>',
    );
    expect(adapter.generate("[a](HTTPS://example.com)")).toEqualIgnoringWhitespace(
      '<p><a href="HTTPS://example.com">a</a></p>',
    );
    expect(adapter.generate("[a](/path?q=a:b)")).toEqualIgnoringWhitespace(
      '<p><a href="/path?q=a:b">a</a></p>',
    );
    expect(adapter.generate("[a](#section)")).toEqualIgnoringWhitespace('<p><a href="#section">a</a></p>');
  });

  test("generate - disallowed schemes", () => {
    const adapter = new MarkdownGeneratorAdapter();

    expect(adapter.generate("[a](javascript:alert(1))")).toEqualIgnoringWhitespace(
      '<p><a href="#">a</a></p>',
    );
    expect(adapter.generate("[a](JaVaScRiPt:alert(1))")).toEqualIgnoringWhitespace(
      '<p><a href="#">a</a></p>',
    );
    expect(adapter.generate("[a](&#106;avascript:alert(1))")).toEqualIgnoringWhitespace(
      '<p><a href="#">a</a></p>',
    );
    expect(adapter.generate("[a](vbscript:msgbox(1))")).toEqualIgnoringWhitespace('<p><a href="#">a</a></p>');
    expect(adapter.generate("[a](data:text/html,x)")).toEqualIgnoringWhitespace('<p><a href="#">a</a></p>');
    expect(adapter.generate("[a][r]\n\n[r]: javascript:alert(1)")).toEqualIgnoringWhitespace(
      '<p><a href="#">a</a></p>',
    );
  });

  test("generate - images untouched", () => {
    const adapter = new MarkdownGeneratorAdapter();

    expect(adapter.generate("![i](data:image/png;base64,AA)")).toEqualIgnoringWhitespace(
      '<p><img src="data:image/png;base64,AA" alt="i" /></p>',
    );
  });
});
