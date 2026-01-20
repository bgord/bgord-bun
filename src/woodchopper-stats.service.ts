export class WoodchopperStats {
  private written = 0;
  private dropped = 0;
  private deliveryFailures = 0;

  recordWritten(): void {
    this.written++;
  }

  recordDropped(): void {
    this.dropped++;
  }

  recordDeliveryFailure(): void {
    this.deliveryFailures++;
  }

  get snapshot() {
    return { written: this.written, dropped: this.dropped, deliveryFailures: this.deliveryFailures };
  }
}
