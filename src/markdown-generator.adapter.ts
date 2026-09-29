// [BUN DEPENDENCY]
import type { MarkdownGeneratorPort } from "./markdown-generator.port";

export class MarkdownGeneratorAdapter implements MarkdownGeneratorPort {
  private static readonly ALLOWED_SCHEMES = ["http", "https", "mailto"];

  generate(template: string): string {
    const html = Bun.markdown.html(template, { tagFilter: true, noHtmlBlocks: true, noHtmlSpans: true });

    return html.replace(/ href="([^"]*)"/g, (attribute, url: string) => {
      const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(url)?.[1]?.toLowerCase();

      if (scheme === undefined || MarkdownGeneratorAdapter.ALLOWED_SCHEMES.includes(scheme)) return attribute;
      return ' href="#"';
    });
  }
}
