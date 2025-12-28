export interface RedactorStrategy {
  redact<T>(value: T): Promise<T>;
}
