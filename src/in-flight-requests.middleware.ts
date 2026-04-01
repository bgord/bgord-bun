import { InFlightRequestsTracker } from "./in-flight-requests-tracker.service";

export class InFlightRequestsMiddleware {
  evaluate(): void {
    InFlightRequestsTracker.increment();
  }

  cleanup(): void {
    InFlightRequestsTracker.decrement();
  }
}
