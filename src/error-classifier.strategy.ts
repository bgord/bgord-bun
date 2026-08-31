import type { HasRequestUrl } from "./request-context.port";

export interface ErrorClassifierStrategy {
  classify(error: unknown, context: HasRequestUrl): Response | null;
}
