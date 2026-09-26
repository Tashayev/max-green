import { useCallback, useState } from "react";
import type { Chat, Message } from "../../../sheared/types/common";
import { ChatHeader } from "./";
import { MessageComposer } from "./";
import { MessageList } from "./";

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string;
  status: string;
  onSend: (text: string) => Promise<void>;
}

export function ChatWindow({
  chat,
  messages,
  loading,
  sending,
  error,
  status,
  onSend,
}: ChatWindowProps) {
  const [text, setText] = useState("");

  const handleSend = useCallback(async () => {
    const value = text.trim();

    if (!value || sending) {
      return;
    }

    await onSend(value);
    setText("");
  }, [onSend, sending, text]);

  if (!chat) {
    return (
      <section className="chat-empty">
        <div className="empty-chat-icon">
          <span>💬</span>
        </div>
        <h2>Начните новый чат</h2>
        <p>
          Добавьте номер телефона получателя,
          чтобы отправить сообщение.
        </p>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <ChatHeader
        chat={chat}
        status={status}
      />

      <MessageList
        messages={messages}
        loading={loading}
      />

      {error && (
        <div className="inline-error">
          {error}
        </div>
      )}

      <MessageComposer
        value={text}
        disabled={loading}
        sending={sending}
        onChange={setText}
        onSend={handleSend}
      />
    </section>
  );
}