import type { ErrorInfo } from "./logger.port";

export function formatError(err: unknown): ErrorInfo {
  if (err instanceof Error) {
    const code = (err as any)?.code;
    const cause = (err as any)?.cause;
    return {
      name: err.name ?? "Error",
      message: err.message ?? "Unknown error",
      stack: err.stack, // always include if present
      code: code != null ? String(code) : undefined,
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
    message: typeof err === "string" ? err : String(err),
  };
}
