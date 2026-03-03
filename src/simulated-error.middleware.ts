export class SimulatedErrorMiddleware {
  evaluate(): never {
    throw new Error("Simulated error");
  }
}
