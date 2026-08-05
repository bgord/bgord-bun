export const SimulatedErrorMiddlewareError = { Simulated: "simulated.error" };

export class SimulatedErrorMiddleware {
  evaluate(): never {
    throw new Error(SimulatedErrorMiddlewareError.Simulated);
  }
}
