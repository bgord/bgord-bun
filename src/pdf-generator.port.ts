export type PdfGeneratorTemplateType = string;

export abstract class PdfGeneratorPort {
  abstract request(template: PdfGeneratorTemplateType, data: Record<string, unknown>): Promise<Buffer>;
}
