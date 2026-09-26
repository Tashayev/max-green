import type { Chat } from "../../../sheared/types/common";

interface ChatHeaderProps {
  chat: Chat;
  status: string;
}

export function ChatHeader({
  chat,
  status,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="avatar large">
        {chat.displayName
          .slice(0, 1)
          .toUpperCase()}
      </div>

      <div>
        <h2>{chat.displayName}</h2>
        <span>{status}</span>
      </div>
    </header>
  );
}