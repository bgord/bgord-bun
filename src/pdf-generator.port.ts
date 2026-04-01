export type PdfGeneratorTemplateType = string;

export interface PdfGeneratorPort {
  request(template: PdfGeneratorTemplateType, data: Record<string, unknown>): Promise<ArrayBuffer>;
}
