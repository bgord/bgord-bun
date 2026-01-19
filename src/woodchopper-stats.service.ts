export class WoodchopperStats {
  private written = 0;
  private dropped = 0;

  recordWritten(): void {
    this.written++;
  }

  recordDropped(): void {
    this.dropped++;
  }

  get snapshot() {
    return { written: this.written, dropped: this.dropped };
  }
}
