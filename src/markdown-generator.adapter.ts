import type { MarkdownGeneratorPort } from "./markdown-generator.port";

export class MarkdownGeneratorAdapter implements MarkdownGeneratorPort {
  generate(template: string): string {
    return Bun.markdown.html(template);
  }
}
