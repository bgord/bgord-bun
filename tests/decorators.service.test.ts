import { describe, expect, spyOn, test } from "bun:test";
import { Decorators } from "../src/decorators.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

const Logger = new LoggerNoopAdapter();

describe("Decorators service", () => {
  test("logs duration of a sync non-static method", () => {
    const loggerInfo = spyOn(Logger, "info");
    const decorators = new Decorators(Logger as any);

    class TestClass {
      // @ts-expect-error
      @decorators.duration()
      compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }
    const instance = new TestClass();

    const result = instance.compute();

    expect(result).toEqual(42);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "TestClass.compute duration",
      metadata: { durationMs: expect.any(Number) },
      operation: "decorators_duration_ms",
    });
  });

  test("logs duration of a sync static method", () => {
    const loggerInfo = spyOn(Logger, "info");
    const decorators = new Decorators(Logger as any);

    class TestClass {
      // @ts-expect-error
      @decorators.duration()
      static compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }

    const result = TestClass.compute();

    expect(result).toEqual(42);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "TestClass.compute duration",
      metadata: { durationMs: expect.any(Number) },
      operation: "decorators_duration_ms",
    });
  });

  test("logs duration of an async non-static method", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const decorators = new Decorators(Logger as any);

    class TestClass {
      // @ts-expect-error
      @decorators.duration()
      async compute() {
        for (let i = 0; i < 1e5; i++) {}
        return 42;
      }
    }
    const instance = new TestClass();

    const result = await instance.compute();

    expect(result).toEqual(42);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "TestClass.compute duration",
      metadata: { durationMs: expect.any(Number) },
      operation: "decorators_duration_ms",
    });
  });

  test("logs duration of an async static method", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const decorators = new Decorators(Logger as any);

    class TestClass {
      // @ts-expect-error
      @decorators.duration()
      static async compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }
    const result = await TestClass.compute();

    expect(result).toEqual(42);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "TestClass.compute duration",
      metadata: { durationMs: expect.any(Number) },
      operation: "decorators_duration_ms",
    });
  });

  test("logs arguments and output of a sync non-static method with inspector", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const decorators = new Decorators(Logger as any);
    class TestClass {
      // @ts-expect-error
      @decorators.inspector()
      fetchData(x: number, y: number) {
        return x + y;
      }
    }
    const instance = new TestClass();

    const result = await instance.fetchData(2, 3);

    expect(result).toEqual(5);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "TestClass.fetchData inspector",
      metadata: { arguments: [2, 3], output: 5 },
      operation: "decorators_inspector",
    });
  });

  test("logs arguments and output of an async non-static method", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const decorators = new Decorators(Logger as any);
    class TestClass {
      // @ts-expect-error
      @decorators.inspector()
      async fetchData(x: number, y: number) {
        return x + y;
      }
    }
    const instance = new TestClass();

    const result = await instance.fetchData(2, 3);

    expect(result).toEqual(5);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "TestClass.fetchData inspector",
      metadata: { arguments: [2, 3], output: 5 },
      operation: "decorators_inspector",
    });
  });

  test("logs arguments and output of a sync static method", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const decorators = new Decorators(Logger as any);
    class TestClass {
      // @ts-expect-error
      @decorators.inspector()
      static fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const result = await TestClass.fetchData(2, 3);

    expect(result).toEqual(5);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "TestClass.fetchData inspector",
      metadata: { arguments: [2, 3], output: 5 },
      operation: "decorators_inspector",
    });
  });

  test("logs arguments and output of an async static method", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const decorators = new Decorators(Logger as any);
    class TestClass {
      // @ts-expect-error
      @decorators.inspector()
      static async fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const result = await TestClass.fetchData(2, 3);

    expect(result).toEqual(5);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "TestClass.fetchData inspector",
      metadata: { arguments: [2, 3], output: 5 },
      operation: "decorators_inspector",
    });
  });
});
