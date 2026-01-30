export interface MarkdownGeneratorPort {
  generate(template: string): string;
}
