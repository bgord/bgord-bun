export class EncryptionIV {
  static generate(): Uint8Array {
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);

    return iv;
  }
}
