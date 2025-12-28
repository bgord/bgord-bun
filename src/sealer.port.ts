export interface SealerPort {
  seal(value: unknown): Promise<string>;
  unseal(value: string): Promise<unknown>;
}
