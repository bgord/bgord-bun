import DOMPurify from "isomorphic-dompurify";
import { Marked } from "marked";
import type { MarkdownGeneratorPort } from "./markdown-generator.port";

export class MarkdownGeneratorMarkedAdapter implements MarkdownGeneratorPort {
  private readonly instance: Marked;

  constructor() {
    this.instance = new Marked();
  }

  async generate(content: string) {
    return DOMPurify.sanitize(await this.instance.parse(content));
  }
}
