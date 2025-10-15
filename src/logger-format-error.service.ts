import type { ErrorInfo } from "./logger.port";

export function formatError(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    const code = (error as any)?.code;
    const cause = error?.cause;

    return {
      name: error.name ?? "Error",
      message: error.message ?? "Unknown error",
      stack: error.stack,
      code: code ?? undefined,
      cause:
        cause instanceof Error
          ? { name: cause.name, message: cause.message }
          : typeof cause === "string"
            ? { message: cause }
            : undefined,
    };
  }
  return {
    name: "NonErrorThrown",
    message: typeof error === "string" ? error : String(error),
  };
}
