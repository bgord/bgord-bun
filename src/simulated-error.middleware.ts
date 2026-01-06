import { createMiddleware } from "hono/factory";

export class SimulatedError {
  static handle = () =>
    createMiddleware(async (_, _next) => {
      throw new Error("Simulated error");
    });
}
