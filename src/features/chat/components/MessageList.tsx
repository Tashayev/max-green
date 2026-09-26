import {
  useEffect,
  useRef,
} from "react";
import type { Message } from "../../../shared/types/common";
import { MessageBubble } from "./";

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export function MessageList({
  messages,
  loading = false,
}: MessageListProps) {
  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="messages-state">
        Загрузка истории...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="messages-state">
        <div className="date-pill">
          Сегодня
        </div>
        <p>Сообщений пока нет</p>
      </div>
    );
  }

  return (
    <div className="messages">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}