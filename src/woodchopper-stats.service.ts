export class WoodchopperStats {
  private accepted = 0;
  private dropped = 0;
  private deliveryFailures = 0;

  recordAccepted(): void {
    this.accepted++;
  }

  recordDropped(): void {
    this.dropped++;
  }

  recordDeliveryFailure(): void {
    this.deliveryFailures++;
  }

  get snapshot() {
    return { accepted: this.accepted, dropped: this.dropped, deliveryFailures: this.deliveryFailures };
  }
}
