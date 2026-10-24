import type * as v from "valibot";
import { UUID } from "../../../uuid.vo";

export const UserId = UUID;
export type UserIdType = v.InferOutput<typeof UserId>;
