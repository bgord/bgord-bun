import { beforeEach, describe, expect, test } from "bun:test";
import { Decorators } from "../src/decorators.service";

class FakeLogger {
  public logs: any[] = [];

  info(log: any) {
    this.logs.push(log);
  }
}

describe("Decorators service", () => {
  let logger: FakeLogger;
  let decorators: Decorators;

  beforeEach(() => {
    logger = new FakeLogger();
    decorators = new Decorators(logger as any);
  });

  test("logs duration of a sync non-static method", () => {
    class TestClass {
      @decorators.duration()
      compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }

    const instance = new TestClass();
    const result = instance.compute();

    expect(result).toEqual(42);
    expect(logger.logs.length).toEqual(1);
    const log = logger.logs[0];

    expect(log.message).toEqual("TestClass.compute duration");
    expect(log.operation).toEqual("decorators_duration_ms");
    expect(typeof log.metadata.durationMs).toEqual("number");
    expect(log.metadata.durationMs).toBeGreaterThan(0);
  });

  test("logs duration of a sync static method", () => {
    class TestClass {
      @decorators.duration()
      static compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }

    const result = TestClass.compute();

    expect(result).toEqual(42);
    expect(logger.logs.length).toEqual(1);
    const log = logger.logs[0];

    expect(log.message).toEqual("TestClass.compute duration");
    expect(log.operation).toEqual("decorators_duration_ms");
    expect(typeof log.metadata.durationMs).toEqual("number");
    expect(log.metadata.durationMs).toBeGreaterThan(0);
  });

  test("logs duration of an async non-static method", async () => {
    class TestClass {
      @decorators.duration()
      async compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }

    const instance = new TestClass();
    const result = await instance.compute();

    expect(result).toEqual(42);
    expect(logger.logs.length).toEqual(1);
    const log = logger.logs[0];

    expect(log.message).toEqual("TestClass.compute duration");
    expect(log.operation).toEqual("decorators_duration_ms");
    expect(typeof log.metadata.durationMs).toEqual("number");
    expect(log.metadata.durationMs).toBeGreaterThan(0);
  });

  test("logs duration of an async static method", async () => {
    class TestClass {
      @decorators.duration()
      static async compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }

    const result = await TestClass.compute();

    expect(result).toEqual(42);
    expect(logger.logs.length).toEqual(1);
    const log = logger.logs[0];

    expect(log.message).toEqual("TestClass.compute duration");
    expect(log.operation).toEqual("decorators_duration_ms");
    expect(typeof log.metadata.durationMs).toEqual("number");
    expect(log.metadata.durationMs).toBeGreaterThan(0);
  });

  test("logs arguments and output of a sync non-static method with inspector", async () => {
    class TestClass {
      @decorators.inspector()
      fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const instance = new TestClass();
    const result = await instance.fetchData(2, 3);

    expect(result).toEqual(5);
    expect(logger.logs.length).toEqual(1);
    const log = logger.logs[0];

    expect(log.message).toEqual("TestClass.fetchData inspector");
    expect(log.operation).toEqual("decorators_inspector");
    expect(log.metadata.arguments).toEqual([2, 3]);
    expect(log.metadata.output).toEqual(5);
  });

  test("logs arguments and output of an async non-static method", async () => {
    class TestClass {
      @decorators.inspector()
      async fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const instance = new TestClass();
    const result = await instance.fetchData(2, 3);

    expect(result).toEqual(5);
    expect(logger.logs.length).toEqual(1);
    const log = logger.logs[0];

    expect(log.message).toEqual("TestClass.fetchData inspector");
    expect(log.operation).toEqual("decorators_inspector");
    expect(log.metadata.arguments).toEqual([2, 3]);
    expect(log.metadata.output).toEqual(5);
  });

  test("logs arguments and output of a sync static method", async () => {
    class TestClass {
      @decorators.inspector()
      static fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const result = await TestClass.fetchData(2, 3);

    expect(result).toEqual(5);
    expect(logger.logs.length).toEqual(1);
    const log = logger.logs[0];

    expect(log.message).toEqual("TestClass.fetchData inspector");
    expect(log.operation).toEqual("decorators_inspector");
    expect(log.metadata.arguments).toEqual([2, 3]);
    expect(log.metadata.output).toEqual(5);
  });

  test("logs arguments and output of an async static method", async () => {
    class TestClass {
      @decorators.inspector()
      static async fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const result = await TestClass.fetchData(2, 3);

    expect(result).toEqual(5);
    expect(logger.logs.length).toEqual(1);
    const log = logger.logs[0];

    expect(log.message).toEqual("TestClass.fetchData inspector");
    expect(log.operation).toEqual("decorators_inspector");
    expect(log.metadata.arguments).toEqual([2, 3]);
    expect(log.metadata.output).toEqual(5);
  });
});
