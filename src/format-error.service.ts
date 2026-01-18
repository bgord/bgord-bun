import type { ErrorInfo } from "./logger.port";

export function formatError(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error
        ? formatError(error.cause)
        : typeof error.cause === "string"
          ? { message: error.cause }
          : undefined;

    return { name: error.name, message: error.message || "Unknown error", stack: error.stack, cause };
  }

  if (typeof error === "string") return { message: error };

  return { message: String(error) };
}
