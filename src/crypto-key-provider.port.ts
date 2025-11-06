export interface CryptoKeyProviderPort {
  get(): Promise<CryptoKey>;
}
