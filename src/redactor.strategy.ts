export interface RedactorStrategy {
  redact<T>(value: T): T;
}
