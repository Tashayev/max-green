import type { Message } from "../../../sheared/types/common";
import type { GreenApiMessage } from "../../../api/types";

export function mapGreenApiMessage(
  message: GreenApiMessage
): Message | null {
  const text =
    message.textMessage ??
    message.extendedTextMessage?.text;

  if (!text) {
    return null;
  }

  return {
    id: message.idMessage,
    text,
    direction: message.type,
    timestamp: message.timestamp,
    status: "sent",
  };
}

export function mapHistory(
  history: GreenApiMessage[]
): Message[] {
  return history
    .map(mapGreenApiMessage)
    .filter((message): message is Message => message !== null)
    .reverse();
}