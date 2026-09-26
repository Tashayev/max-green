import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { waitFor } from "@testing-library/dom"
import { useChat } from "./useChat"
import { MOCK_API } from "../../../tests/mocks"
import type { Message } from "../../../sheared/types/common"
import type { GreenApiMessage, SendMessageResponse } from "../../../api/types"
import { CHAT_ID, TEST_CREDS } from "../../../tests/fixtures"

vi.mock("../../../api/greenApi", () => ({
  greenApi: {
    getChatHistory: vi.fn(),
    sendMessage: vi.fn(),
  },
}))

const makeMessage = (
  overrides: Partial<GreenApiMessage> = {},
): GreenApiMessage => ({
  idMessage: "id-1",
  chatId: CHAT_ID,
  typeMessage: "textMessage",
  textMessage: "hi",
  type: "incoming",
  timestamp: 1,
  ...overrides,
})

const sendResponse: SendMessageResponse = { idMessage: "sent-1" }

beforeEach(() => {
  vi.clearAllMocks()
})

describe("useChat", () => {
  it("грузит историю при монтировании", async () => {
    MOCK_API.getChatHistory.mockResolvedValue([
      makeMessage({ idMessage: "1", textMessage: "привет" }),
      makeMessage({ idMessage: "2", textMessage: "как дела" }),
    ])

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(MOCK_API.getChatHistory).toHaveBeenCalledWith(
      TEST_CREDS,
      CHAT_ID,
      100,
      expect.any(AbortSignal),
    )
    expect(result.current.messages).toHaveLength(2)
  })

  it("не грузит ничего если нет credentials", () => {
    const { result } = renderHook(() => useChat(null, CHAT_ID))

    expect(MOCK_API.getChatHistory).not.toHaveBeenCalled()
    expect(result.current.messages).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it("не грузит ничего если нет chatId", () => {
    renderHook(() => useChat(TEST_CREDS, null))
    expect(MOCK_API.getChatHistory).not.toHaveBeenCalled()
  })

  it("чистит messages когда chatId пропал", async () => {
    MOCK_API.getChatHistory.mockResolvedValue([makeMessage()])

    type Props = { id: string | null }
    const initialProps: Props = { id: CHAT_ID }

    const { result, rerender } = renderHook(
      ({ id }: Props) => useChat(TEST_CREDS, id),
      { initialProps },
    )

    await waitFor(() => expect(result.current.messages).toHaveLength(1))

    rerender({ id: null })

    await waitFor(() => expect(result.current.messages).toEqual([]))
  })

  it("пишет ошибку если история упала", async () => {
    MOCK_API.getChatHistory.mockRejectedValue(new Error("500"))

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))

    await waitFor(() => expect(result.current.error).toBe("500"))
    expect(result.current.loading).toBe(false)
  })

  it("не пишет ошибку на AbortError", async () => {
    MOCK_API.getChatHistory.mockRejectedValue(
      new DOMException("aborted", "AbortError"),
    )

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe("")
  })

  it("reload руками перезагружает историю", async () => {
    MOCK_API.getChatHistory.mockResolvedValueOnce([makeMessage()])

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))
    await waitFor(() => expect(result.current.messages).toHaveLength(1))

    MOCK_API.getChatHistory.mockResolvedValueOnce([
      makeMessage({ idMessage: "1" }),
      makeMessage({ idMessage: "2" }),
    ])

    await act(async () => {
      await result.current.reload()
    })

    expect(result.current.messages).toHaveLength(2)
  })

  it("reload чистит messages если нет TEST_CREDS/chatId", async () => {
    const { result } = renderHook(() => useChat(null, null))

    await act(async () => {
      await result.current.reload()
    })

    expect(result.current.messages).toEqual([])
    expect(MOCK_API.getChatHistory).not.toHaveBeenCalled()
  })

  it("send добавляет оптимистичное сообщение и помечает sent", async () => {
    MOCK_API.getChatHistory.mockResolvedValue([])

    let resolveSend!: (value: SendMessageResponse) => void
    MOCK_API.sendMessage.mockImplementation(
      () =>
        new Promise<SendMessageResponse>((resolve) => {
          resolveSend = resolve
        }),
    )

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let sendPromise!: Promise<void>
    act(() => {
      sendPromise = result.current.send("привет")
    })

    await waitFor(() => expect(result.current.messages).toHaveLength(1))
    expect(result.current.messages[0].text).toBe("привет")
    expect(result.current.messages[0].status).toBe("sending")
    expect(result.current.messages[0].direction).toBe("outgoing")
    expect(result.current.sending).toBe(true)

    await act(async () => {
      resolveSend(sendResponse)
      await sendPromise
    })

    expect(result.current.messages[0].status).toBe("sent")
    expect(result.current.sending).toBe(false)
    expect(MOCK_API.sendMessage).toHaveBeenCalledWith(TEST_CREDS, CHAT_ID, "привет")
  })

  it("send помечает failed при ошибке и пишет error", async () => {
    MOCK_API.getChatHistory.mockResolvedValue([])
    MOCK_API.sendMessage.mockRejectedValue(new Error("нет соединения"))

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.send("эй")
    })

    expect(result.current.messages[0].status).toBe("failed")
    expect(result.current.error).toBe("нет соединения")
    expect(result.current.sending).toBe(false)
  })

  it("send игнорит пустую строку и пробелы", async () => {
    MOCK_API.getChatHistory.mockResolvedValue([])
    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.send("   ")
      await result.current.send("")
    })

    expect(MOCK_API.sendMessage).not.toHaveBeenCalled()
    expect(result.current.messages).toEqual([])
  })

  it("send ничего не делает без TEST_CREDS или chatId", async () => {
    const { result } = renderHook(() => useChat(null, null))

    await act(async () => {
      await result.current.send("привет")
    })

    expect(MOCK_API.sendMessage).not.toHaveBeenCalled()
    expect(result.current.messages).toEqual([])
  })

  it("send не запускается второй раз пока первый в полёте", async () => {
    MOCK_API.getChatHistory.mockResolvedValue([])

    let resolveSend!: (value: SendMessageResponse) => void
    MOCK_API.sendMessage.mockImplementation(
      () =>
        new Promise<SendMessageResponse>((resolve) => {
          resolveSend = resolve
        }),
    )

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let p!: Promise<void>
    act(() => {
      p = result.current.send("раз")
    })

    await waitFor(() => expect(result.current.sending).toBe(true))

    await act(async () => {
      await result.current.send("два")
    })

    expect(MOCK_API.sendMessage).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveSend(sendResponse)
      await p
    })
  })

  it("обрезает пробелы по краям перед отправкой", async () => {
    MOCK_API.getChatHistory.mockResolvedValue([])
    MOCK_API.sendMessage.mockResolvedValue(sendResponse)

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.send("  привет  ")
    })

    expect(MOCK_API.sendMessage).toHaveBeenCalledWith(TEST_CREDS, CHAT_ID, "привет")
    expect(result.current.messages[0].text).toBe("привет")
  })
  it("addMessage добавляет входящее сообщение", async () => {
    MOCK_API.getChatHistory.mockResolvedValue([])

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const incoming: Message = {
      id: "incoming-1",
      text: "Привет",
      direction: "incoming",
      timestamp: 1,
      status: "sent",
    }

    act(() => {
      result.current.addMessage(incoming)
    })

    expect(result.current.messages).toContainEqual(incoming)
  })

  it("addMessage не дублирует сообщение с тем же id", async () => {
    MOCK_API.getChatHistory.mockResolvedValue([])

    const { result } = renderHook(() => useChat(TEST_CREDS, CHAT_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const incoming: Message = {
      id: "incoming-1",
      text: "Привет",
      direction: "incoming",
      timestamp: 1,
      status: "sent",
    }

    act(() => {
      result.current.addMessage(incoming)
      result.current.addMessage(incoming)
    })

    expect(result.current.messages).toHaveLength(1)
  })
})
