import type { Message } from "./message.types";

export type SseSenderStrategy<Messages extends Message> = <M extends Messages>(message: M) => Promise<void>;
