import { useCallback, useEffect, useState } from "react"
import { greenApi } from "../../../api/greenApi"
import type { Credentials, Message } from "../../../sheared/types/common"
import { mapHistory } from "../utils/messageMappers"
import { HISTORY_LIMIT } from "../../../sheared/utils/constants/constants"



interface UseChatResult {
  messages: Message[]
  loading: boolean
  sending: boolean
  error: string
  send: (text: string) => Promise<void>
  reload: () => Promise<void>
  addMessage: (message: Message) => void
}

export function useChat(
  credentials: Credentials | null,
  chatId: string | null,
): UseChatResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const reload = useCallback(async () => {
    if (!credentials || !chatId) {
      setMessages([])
      return
    }

    setLoading(true)
    setError("")

    try {
      const history = await greenApi.getChatHistory(
        credentials,
        chatId,
        HISTORY_LIMIT,
      )

      setMessages(mapHistory(history))
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        return
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось загрузить историю.",
      )
    } finally {
      setLoading(false)
    }
  }, [credentials, chatId])

  useEffect(() => {
    const controller = new AbortController()

    if (!credentials || !chatId) {
      setMessages([])
      return () => controller.abort()
    }

    setLoading(true)
    setError("")

    greenApi
      .getChatHistory(credentials, chatId, HISTORY_LIMIT, controller.signal)
      .then((history) => {
        setMessages(mapHistory(history))
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось загрузить историю.",
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [credentials, chatId])

  const send = useCallback(
    async (text: string) => {
      if (!credentials || !chatId || sending) {
        return
      }

      const messageText = text.trim()

      if (!messageText) {
        return
      }

      setSending(true)
      setError("")

      const optimisticId = `local-${crypto.randomUUID()}`

      setMessages((current) => [
        ...current,
        {
          id: optimisticId,
          text: messageText,
          direction: "outgoing",
          timestamp: Math.floor(Date.now() / 1000),
          status: "sending",
        },
      ])

      try {
        await greenApi.sendMessage(credentials, chatId, messageText)

        setMessages((current) =>
          current.map((message) =>
            message.id === optimisticId
              ? { ...message, status: "sent" }
              : message,
          ),
        )
      } catch (requestError) {
        setMessages((current) =>
          current.map((message) =>
            message.id === optimisticId
              ? { ...message, status: "failed" }
              : message,
          ),
        )

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось отправить сообщение.",
        )
      } finally {
        setSending(false)
      }
    },
    [credentials, chatId, sending],
  )

  const addMessage = useCallback((message: Message) => {
    setMessages((current) => {
      if (current.some((existing) => existing.id === message.id)) {
        return current
      }

      return [...current, message]
    })
  }, [])

  return {
    messages,
    loading,
    sending,
    error,
    send,
    reload,
    addMessage,
  }
}
