export type VisitorIdType = string;

export interface VisitorIdPort {
  get(): Promise<VisitorIdType>;
}
