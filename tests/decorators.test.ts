import { beforeEach, describe, expect, test } from "bun:test";
import { Decorators, DecoratorTimeoutError } from "../src/decorators.service";

class FakeLogger {
  public logs: any[] = [];

  info(log: any) {
    this.logs.push(log);
  }
}

describe("Decorators", () => {
  let logger: FakeLogger;
  let decorators: Decorators;

  beforeEach(() => {
    logger = new FakeLogger();
    decorators = new Decorators(logger as any);
  });

  test("should log duration of a sync non-static method", () => {
    class TestClass {
      @decorators.duration()
      compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }

    const instance = new TestClass();
    const result = instance.compute();

    expect(result).toBe(42);
    expect(logger.logs.length).toBe(1);
    const log = logger.logs[0];

    expect(log.message).toBe("TestClass.compute duration");
    expect(log.operation).toBe("decorators_duration_ms");
    expect(typeof log.metadata.durationMs).toBe("number");
    expect(log.metadata.durationMs).toBeGreaterThan(0);
  });

  test("should log duration of a sync static method", () => {
    class TestClass {
      @decorators.duration()
      static compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }

    const result = TestClass.compute();

    expect(result).toBe(42);
    expect(logger.logs.length).toBe(1);
    const log = logger.logs[0];

    expect(log.message).toBe("TestClass.compute duration");
    expect(log.operation).toBe("decorators_duration_ms");
    expect(typeof log.metadata.durationMs).toBe("number");
    expect(log.metadata.durationMs).toBeGreaterThan(0);
  });

  test("should log duration of an async non-static method", async () => {
    class TestClass {
      @decorators.duration()
      async compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }

    const instance = new TestClass();
    const result = await instance.compute();

    expect(result).toBe(42);
    expect(logger.logs.length).toBe(1);
    const log = logger.logs[0];

    expect(log.message).toBe("TestClass.compute duration");
    expect(log.operation).toBe("decorators_duration_ms");
    expect(typeof log.metadata.durationMs).toBe("number");
    expect(log.metadata.durationMs).toBeGreaterThan(0);
  });

  test("should log duration of an async static method", async () => {
    class TestClass {
      @decorators.duration()
      static async compute() {
        for (let i = 0; i < 1e5; i++) {} // simulate work
        return 42;
      }
    }

    const result = await TestClass.compute();

    expect(result).toBe(42);
    expect(logger.logs.length).toBe(1);
    const log = logger.logs[0];

    expect(log.message).toBe("TestClass.compute duration");
    expect(log.operation).toBe("decorators_duration_ms");
    expect(typeof log.metadata.durationMs).toBe("number");
    expect(log.metadata.durationMs).toBeGreaterThan(0);
  });

  test("should log arguments and output of a sync non-static method with inspector", async () => {
    class TestClass {
      @decorators.inspector()
      fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const instance = new TestClass();
    const result = await instance.fetchData(2, 3);

    expect(result).toBe(5);
    expect(logger.logs.length).toBe(1);
    const log = logger.logs[0];

    expect(log.message).toBe("TestClass.fetchData inspector");
    expect(log.operation).toBe("decorators_inspector");
    expect(log.metadata.arguments).toEqual([2, 3]);
    expect(log.metadata.output).toBe(5);
  });

  test("should log arguments and output of an async non-static method with inspector", async () => {
    class TestClass {
      @decorators.inspector()
      async fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const instance = new TestClass();
    const result = await instance.fetchData(2, 3);

    expect(result).toBe(5);
    expect(logger.logs.length).toBe(1);
    const log = logger.logs[0];

    expect(log.message).toBe("TestClass.fetchData inspector");
    expect(log.operation).toBe("decorators_inspector");
    expect(log.metadata.arguments).toEqual([2, 3]);
    expect(log.metadata.output).toBe(5);
  });

  test("should log arguments and output of a sync static method with inspector", async () => {
    class TestClass {
      @decorators.inspector()
      static fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const result = await TestClass.fetchData(2, 3);

    expect(result).toBe(5);
    expect(logger.logs.length).toBe(1);
    const log = logger.logs[0];

    expect(log.message).toBe("TestClass.fetchData inspector");
    expect(log.operation).toBe("decorators_inspector");
    expect(log.metadata.arguments).toEqual([2, 3]);
    expect(log.metadata.output).toBe(5);
  });

  test("should log arguments and output of an async static method with inspector", async () => {
    class TestClass {
      @decorators.inspector()
      static async fetchData(x: number, y: number) {
        return x + y;
      }
    }

    const result = await TestClass.fetchData(2, 3);

    expect(result).toBe(5);
    expect(logger.logs.length).toBe(1);
    const log = logger.logs[0];

    expect(log.message).toBe("TestClass.fetchData inspector");
    expect(log.operation).toBe("decorators_inspector");
    expect(log.metadata.arguments).toEqual([2, 3]);
    expect(log.metadata.output).toBe(5);
  });

  test("should allow methods that finish before timeout for async methods", async () => {
    class TestClass {
      wasCalled = false;

      @decorators.timeout(100)
      async fastMethod() {
        this.wasCalled = true;
        return "done";
      }
    }

    const instance = new TestClass();
    const result = await instance.fastMethod();
    expect(result).toBe("done");
    expect(instance.wasCalled).toBe(true);
  });

  test("should throw if the method exceeds the timeout for async methods", async () => {
    class TestClass {
      wasCalled = false;

      @decorators.timeout(50)
      async slowMethod() {
        this.wasCalled = true;
        await new Promise((res) => setTimeout(res, 100));
        return "slow";
      }
    }

    const instance = new TestClass();

    expect(instance.slowMethod()).rejects.toThrow(DecoratorTimeoutError);
    expect(instance.wasCalled).toBe(true); // still started
  });

  test("should preserve method context (`this`)", async () => {
    class TestClass {
      wasCalled = false;

      @decorators.timeout(100)
      async fastMethod() {
        this.wasCalled = true;
        return "done";
      }
    }

    const instance = new TestClass();
    await instance.fastMethod();
    expect(instance.wasCalled).toBe(true);
  });
});
