export class EncryptionIV {
  static readonly LENGTH = 12;

  static generate(): Uint8Array {
    const iv = new Uint8Array(EncryptionIV.LENGTH);
    crypto.getRandomValues(iv);

    return iv;
  }
}
