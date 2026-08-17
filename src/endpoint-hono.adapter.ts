import type { Handler } from "hono";
import type { EndpointPort } from "./endpoint.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export class EndpointHonoAdapter {
  static adapt(endpoint: EndpointPort): Handler {
    return (c) => endpoint(new RequestContextHonoAdapter(c));
  }
}
