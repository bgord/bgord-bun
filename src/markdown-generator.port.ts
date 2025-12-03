export abstract class MarkdownGeneratorPort {
  abstract generate(input: string): Promise<string>;
}
