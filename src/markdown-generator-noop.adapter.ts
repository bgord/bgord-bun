import type { MarkdownGeneratorPort } from "./markdown-generator.port";

export class MarkdownGeneratorNoopAdapter implements MarkdownGeneratorPort {
  constructor(private readonly value: string = "") {}

  generate(_template: string): string {
    return this.value;
  }
}
