import { Check, CircleAlert } from "lucide-react";
import type { Message } from "../../../shared/types/common";

interface MessageBubbleProps {
  message: Message;
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
}

export function MessageBubble({
  message,
}: MessageBubbleProps) {
  return (
    <div
      className={`message-row ${message.direction}`}
    >
      <div className="message-bubble">
        <div className="message-text">
          {message.text}
        </div>

        <div className="message-meta">
          <span>{formatTime(message.timestamp)}</span>

          {message.direction === "outgoing" &&
            message.status === "sent" && (
              <Check size={14} />
            )}

          {message.direction === "outgoing" &&
            message.status === "failed" && (
              <CircleAlert
                size={14}
                className="failed-icon"
              />
            )}
        </div>
      </div>
    </div>
  );
}