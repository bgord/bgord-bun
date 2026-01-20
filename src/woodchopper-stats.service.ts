export class WoodchopperStats {
  private written = 0;
  private dropped = 0;
  private diagnostics = 0;

  recordWritten(): void {
    this.written++;
  }

  recordDropped(): void {
    this.dropped++;
  }

  recordDiagnostics(): void {
    this.diagnostics++;
  }

  get snapshot() {
    return { written: this.written, dropped: this.dropped, diagnostics: this.diagnostics };
  }
}
