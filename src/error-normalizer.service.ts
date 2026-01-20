export type NormalizedError = { message: string; name?: string; stack?: string; cause?: NormalizedError };

export class ErrorNormalizer {
  static normalize(error: unknown): NormalizedError {
    if (error instanceof Error) {
      const cause =
        error.cause instanceof Error
          ? ErrorNormalizer.normalize(error.cause)
          : typeof error.cause === "string"
            ? { message: error.cause }
            : undefined;

      return { name: error.name, message: error.message || "Unknown error", stack: error.stack, cause };
    }

    if (typeof error === "string") return { message: error };

    return { message: String(error) };
  }
}
