import { createMiddleware } from "hono/factory";

export class SimulatedError {
  static handle = () =>
    createMiddleware(async (_c, _next) => {
      throw new Error("Simulated error");
    });
}
