import { InFlightRequestsTracker } from "./in-flight-requests-tracker.service";

export class InFlightRequestsMiddleware {
  async evaluate(): Promise<void> {
    InFlightRequestsTracker.increment();
  }

  cleanup(): void {
    InFlightRequestsTracker.decrement();
  }
}
