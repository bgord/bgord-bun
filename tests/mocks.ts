import { Writable } from "node:stream";
import * as tools from "@bgord/tools";
import type { Context } from "hono";
import * as winston from "winston";

export function stringToStream(string: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(string));
      controller.close();
    },
  });
}

export const IntentialError = "intentional.error" as const;

export function makeCaptureTransport() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(chunk.toString()); // pretty or single-line JSON; both OK
      cb();
    },
  });

  const transport = new winston.transports.Stream({ stream });

  return { transport, lines };
}

export function createContext(headers: Record<string, string | undefined>): Context {
  return {
    req: { header: (name: string) => headers[name.toLowerCase()] ?? undefined },
    env: { server: { requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }) } },
  } as unknown as Context;
}

// Tue Nov 14 2023 22:13:20 GMT+0000
export const TIME_ZERO = tools.TimestampVO.fromNumber(1700000000000);

export const TIME_ZERO_DATE = "2023-11-14";

export const TIME_ZERO_DATE_UTC = new Date(TIME_ZERO.ms).toUTCString();
