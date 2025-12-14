import type { VisitorIdType } from "./visitor-id.vo";

export interface VisitorIdPort {
  get(): Promise<VisitorIdType>;
}
