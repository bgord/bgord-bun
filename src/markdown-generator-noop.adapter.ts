import type { MarkdownGeneratorPort } from "./markdown-generator.port";

export class MarkdownGeneratorNoopAdapter implements MarkdownGeneratorPort {
  async generate(_content: string) {
    return "<p>noop</p>";
  }
}
