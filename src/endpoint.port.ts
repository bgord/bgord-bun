import type { RequestContext } from "./request-context.port";

export type EndpointPort<T = RequestContext> = (context: T) => Promise<Response> | Response;
