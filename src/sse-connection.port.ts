import type { Message } from "./message.types";

export interface SseConnectionPort {
  send(message: Message): Promise<void>;
  close(): void;
  onClose(callback: () => void): void;
}
