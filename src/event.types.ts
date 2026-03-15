// TODO: use proper VO types.
export type GenericEvent = {
  id: string;
  correlationId: string;
  createdAt: number;
  stream: string;
  revision?: number;
  name: string;
  version: number;
  payload: unknown;
};

export type GenericParsedEvent = Omit<GenericEvent, "payload"> & { payload: string };
