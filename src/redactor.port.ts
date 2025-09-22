export interface RedactorPort {
  redact<T>(value: T): T;
}
