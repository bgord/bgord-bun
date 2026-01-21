import { isPlainObject } from "./deep-clone-with";

export type NormalizedError = { message: string; name?: string; stack?: string; cause?: NormalizedError };

export class ErrorNormalizer {
  static normalize(error: unknown): NormalizedError {
    return ErrorNormalizer.normalizeWithGuard(error, new WeakSet());
  }

  static isNormalizedError(value: unknown): value is NormalizedError {
    return isPlainObject(value) && "message" in value && typeof value.message === "string";
  }

  private static normalizeWithGuard(error: unknown, seen: WeakSet<object>): NormalizedError {
    if (error instanceof Error) {
      if (seen.has(error)) return { message: error.message || "Circular error cause", name: error.name };

      seen.add(error);

      const cause =
        error.cause instanceof Error
          ? ErrorNormalizer.normalizeWithGuard(error.cause, seen)
          : typeof error.cause === "string"
            ? { message: error.cause }
            : undefined;

      return { message: error.message || "Unknown error", name: error.name, stack: error.stack, cause };
    }

    if (typeof error === "string") return { message: error };

    return { message: String(error) };
  }
}
