import type { ErrorClassifierStrategy } from "./error-classifier.strategy";

export class ErrorClassifierUnknownStrategy implements ErrorClassifierStrategy {
  classify(_error: unknown): Response {
    return Response.json({ message: "general.unknown" }, { status: 500 });
  }
}
