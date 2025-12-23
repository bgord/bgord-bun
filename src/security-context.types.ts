import type { Client } from "./client.vo";

export type SecurityContext = { client: ReturnType<Client["toJSON"]> };
