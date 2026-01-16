import { createMiddleware } from "hono/factory";
import { InFlightRequestsTracker } from "./in-flight-requests-tracker.service";

export class InFlightRequests {
  static handle = () =>
    createMiddleware(async (_, next) => {
      InFlightRequestsTracker.increment();

      try {
        await next();
      } finally {
        InFlightRequestsTracker.decrement();
      }
    });
}
