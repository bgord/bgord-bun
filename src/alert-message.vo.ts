export class AlertMessage {
  constructor(
    readonly message: string,
    readonly error?: unknown,
  ) {}

  toJSON() {
    return { message: this.message, error: this.error };
  }
}
