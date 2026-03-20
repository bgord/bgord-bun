import { describe, expect, test } from "bun:test";
import { AlertMessage } from "../src/alert-message.vo";

const alert = new AlertMessage("Payment failed");

const error = new Error("db connection lost");
const alertWthError = new AlertMessage("Payment failed", error);

describe("AlertMessage", () => {
  test("message", () => {
    expect(alert.message).toEqual("Payment failed");
  });

  test("message + error", () => {
    expect(alertWthError.error).toBe(error);
  });

  test("toJSON - message", () => {
    expect(alert.toJSON()).toEqual({ message: "Payment failed", error: undefined });
  });

  test("toJSON - message + error", () => {
    expect(alertWthError.toJSON()).toEqual({ message: "Payment failed", error });
  });
});
