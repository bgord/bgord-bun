import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const limit = tools.Int.positive(2);

describe("Semaphore", () => {
  test("happy path", async () => {
    using action = jest.fn();
    const semaphore = new Semaphore({ limit });

    await semaphore.run(action);

    expect(action).toHaveBeenCalledTimes(1);
  });

  test("error", async () => {
    const semaphore = new Semaphore({ limit });

    expect(async () => semaphore.run(mocks.throwIntentionalErrorAsync)).toThrow(mocks.IntentionalError);
  });

  test("slot release", async () => {
    const semaphore = new Semaphore({ limit: tools.Int.positive(1) });

    expect(async () => semaphore.run(mocks.throwIntentionalErrorAsync)).toThrow(mocks.IntentionalError);
    expect(await semaphore.run(async () => "ok")).toEqual("ok");
  });

  test("limits concurrency", async () => {
    const semaphore = new Semaphore({ limit });

    let running = 0;
    let maxRunning = 0;

    const action = async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await Promise.resolve();
      running--;
    };

    await Promise.all([semaphore.run(action), semaphore.run(action), semaphore.run(action)]);

    expect(maxRunning).toEqual(2);
  });

  test("uses free capacity", async () => {
    const semaphore = new Semaphore({ limit });
    const started: Array<number> = [];
    const gates = [
      Promise.withResolvers<void>(),
      Promise.withResolvers<void>(),
      Promise.withResolvers<void>(),
    ];
    const action = (id: number) => async () => {
      started.push(id);
      await gates[id]?.promise;
    };

    const runs = [semaphore.run(action(0)), semaphore.run(action(1)), semaphore.run(action(2))];

    for (let flush = 0; flush < 5; flush++) await Promise.resolve();

    expect(started).toEqual([0, 1]);

    gates[1]?.resolve();

    for (let flush = 0; flush < 5; flush++) await Promise.resolve();

    expect(started).toEqual([0, 1, 2]);

    gates[0]?.resolve();
    gates[2]?.resolve();
    await Promise.all(runs);
  });

  test("preserves ordering", async () => {
    const order: Array<number> = [];
    const action = (id: number) => async () => order.push(id);
    const semaphore = new Semaphore({ limit });

    await semaphore.run(action(1));
    await semaphore.run(action(2));
    await semaphore.run(action(3));

    expect(order).toEqual([1, 2, 3]);
  });
});
