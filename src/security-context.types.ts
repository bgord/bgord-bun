import type { Client } from "./client.vo";

export type SecurityContext = {
  rule: string;
  client: ReturnType<Client["toJSON"]>;
  userId: string | undefined;
};
