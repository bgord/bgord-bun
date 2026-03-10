export class DynamicImport<T> {
  private constructor(
    private readonly dependency: string,
    private readonly error: string,
  ) {}

  static for<T>(dependency: string, error: string): DynamicImport<T> {
    return new DynamicImport<T>(dependency, error);
  }

  async resolve(): Promise<T> {
    try {
      return await this.import();
    } catch {
      throw new Error(this.error);
    }
  }

  private async import(): Promise<T> {
    return import(this.obfuscate(this.dependency)) as Promise<T>;
  }

  private obfuscate(name: string): string {
    return name;
  }
}
