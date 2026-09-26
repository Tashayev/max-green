import { useCallback, useEffect, useState } from "react"
import type { Chat, Credentials, Message } from "./sheared/types/common"
import { useCredentials } from "./features/auth/hooks/useCredentials"
import { SetupScreen } from "./features/auth/components/SetupScreen"
import {
  ChatSidebar,
  ChatWindow,
  NewChatModal,
} from "./features/chat/components"

import { SettingsModal } from "./features/settings/SettingsModal"
import { useChat, useNotifications } from "./features/chat/hooks"
import { CHAT_STORAGE_KEY } from "./sheared/constants/storageKeys"
import { readStoredChat } from "./sheared/utils/chatStoreUtils"
import { useConnection } from "./features/auth/hooks/useConnection"

export default function App() {
  const [chat, setChat] = useState<Chat | null>(readStoredChat)
  const [status, setStatus] = useState("GREEN-API подключен")
  const [showNewChat, setShowNewChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notificationError, setNotificationError] = useState("")
  const { credentials, draft, clear, save } = useCredentials()
  const { connect, connecting, setupError } = useConnection()
  const {
    messages,
    loading,
    sending,
    error: chatError,
    send,
  } = useChat(credentials, chat?.id ?? null)

  const handleIncomingMessage = useCallback((message: Message) => {
    void message
  }, [])

  useNotifications({
    credentials,
    activeChatId: chat?.id ?? null,
    onMessage: handleIncomingMessage,
    onError: setNotificationError,
  })

  const createChat = (nextChat: Chat) => {
    setChat(nextChat)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(nextChat))
    setShowNewChat(false)
    setNotificationError("")
  }

  const handleLogout = () => {
    clear()
    setChat(null)
    localStorage.removeItem(CHAT_STORAGE_KEY)
  }

  const combinedError = chatError || notificationError
  const handleConnect = async (nextCredentials: Credentials) => {
    const success = await connect(nextCredentials)

    if (success) {
      save(nextCredentials)
      setStatus("Подключено")
    }
  }

  if (!credentials) {
    return (
      <SetupScreen
        initialValues={draft}
        onSubmit={handleConnect}
        error={setupError}
        loading={connecting}
      />
    )
  }

  return (
    <div className="app-shell">
      <ChatSidebar
        chat={chat}
        onNewChat={() => setShowNewChat(true)}
        onSettings={() => setShowSettings(true)}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <ChatWindow
          chat={chat}
          messages={messages}
          loading={loading}
          sending={sending}
          error={combinedError}
          status={status}
          onSend={send}
        />
      </main>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreate={createChat}
        />
      )}

      {showSettings && (
        <SettingsModal
          credentials={credentials}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
