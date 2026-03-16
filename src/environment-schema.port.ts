export interface EnvironmentSchemaPort<T extends object> {
  parse(data: unknown): T;
}
