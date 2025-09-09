import { describe, expect, spyOn, test } from "bun:test";
import * as sslChecker from "ssl-checker";
import { PrerequisiteSSLCertificateExpiry } from "../src/prerequisites/ssl-certificate-expiry";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - ssl certificate expiry", () => {
  test("passes when certificate is valid and has enough days remaining", async () => {
    // @ts-expect-error
    spyOn(sslChecker, "default").mockImplementation(async () => ({ valid: true, daysRemaining: 100 }));

    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl",
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("fails when certificate is valid but expires too soon", async () => {
    // @ts-expect-error
    spyOn(sslChecker, "default").mockImplementation(async () => ({ valid: true, daysRemaining: 10 }));

    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl-certificate",
    });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: "Days remaining: 10" }),
    );
  });

  test("fails when certificate is invalid", async () => {
    // @ts-expect-error
    spyOn(sslChecker, "default").mockImplementation(async () => ({ valid: false, daysRemaining: 0 }));

    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl-certificate",
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.failure({ message: "Invalid" }));
  });

  test("fails when sslChecker throws", async () => {
    spyOn(sslChecker, "default").mockRejectedValue(new Error("SSL check failed"));

    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl-certificate",
    });
    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/SSL check failed/);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl-certificate",
      enabled: false,
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
