import { describe, expect, test } from "bun:test";
import { AlertMessage } from "../src/alert-message.vo";

describe("AlertMessage", () => {
  test("message", () => {
    const alert = new AlertMessage("Payment failed");

    expect(alert.message).toEqual("Payment failed");
  });

  test("message + error", () => {
    const error = new Error("db connection lost");
    const alert = new AlertMessage("Payment failed", error);

    expect(alert.error).toBe(error);
  });

  test("toJSON - message", () => {
    const alert = new AlertMessage("Payment failed");

    expect(alert.toJSON()).toEqual({ message: "Payment failed", error: undefined });
  });

  test("toJSON - message + error", () => {
    const error = new Error("db connection lost");
    const alert = new AlertMessage("Payment failed", error);

    expect(alert.toJSON()).toEqual({ message: "Payment failed", error });
  });
});
