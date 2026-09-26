import {
  LogOut,
  MessageCircle,
  Plus,
  Settings,
} from "lucide-react";
import type { Chat } from "../../../shared/types/common";

interface ChatSidebarProps {
  chat: Chat | null;
  onNewChat: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export function ChatSidebar({
  chat,
  onNewChat,
  onSettings,
  onLogout,
}: ChatSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="mini-logo">
          <MessageCircle size={21} />
        </div>

        <button
          className="icon-button"
          onClick={onNewChat}
          title="Новый чат"
        >
          <Plus size={21} />
        </button>
      </div>

      <div className="chat-list">
        {chat ? (
          <button className="chat-list-item active">
            <div className="avatar">
              {chat.displayName
                .slice(0, 1)
                .toUpperCase()}
            </div>

            <div className="chat-list-content">
              <strong>
                {chat.displayName}
              </strong>
              <span>{chat.phone}</span>
            </div>
          </button>
        ) : (
          <div className="empty-sidebar">
            <MessageCircle size={24} />
            <span>
              Создайте новый чат
            </span>
          </div>
        )}
      </div>

      <div className="sidebar-bottom">
        <button
          className="sidebar-action"
          onClick={onSettings}
        >
          <Settings size={19} />
          <span>Настройки</span>
        </button>

        <button
          className="sidebar-action"
          onClick={onLogout}
        >
          <LogOut size={19} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}