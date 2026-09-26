import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { greenApiGet, greenApiPost, greenApiDelete } from "./client"
import { TEST_CREDS } from "../tests/fixtures"

type FetchMock = ReturnType<
  typeof vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>
>

const BASE = "https://api.green-api.com/waInstance1101000000"

const jsonResponse = (body: unknown, init: ResponseInit = {}): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    ...init,
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

const textResponse = (text: string, init: ResponseInit = {}): Response =>
  new Response(text, init)

describe("greenApiClient", () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("greenApiGet", () => {
    it("собирает URL из метода и кредов", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ ok: true }))

      await greenApiGet("getStateInstance", TEST_CREDS)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]!
      expect(url).toBe(`${BASE}/getStateInstance/abc123`)
      expect(init?.signal).toBeUndefined()
    })

    it("экранирует idInstance и apiTokenInstance", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))

      await greenApiGet("getStateInstance", {
        idInstance: "1 2/3",
        apiTokenInstance: "a&b=c",
      })

      const [url] = fetchMock.mock.calls[0]!
      expect(url).toBe(
        "https://api.green-api.com/waInstance1%202%2F3/getStateInstance/a%26b%3Dc",
      )
    })

    it("добавляет query-параметры, если они есть в методе", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))

      await greenApiGet("getChatHistory?count=100", TEST_CREDS)

      const [url] = fetchMock.mock.calls[0]!
      expect(url).toBe(`${BASE}/getChatHistory/abc123?count=100`)
    })

    it("пробрасывает AbortSignal в fetch", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))
      const controller = new AbortController()

      await greenApiGet("getStateInstance", TEST_CREDS, controller.signal)

      const [, init] = fetchMock.mock.calls[0]!
      expect(init?.signal).toBe(controller.signal)
    })

    it("возвращает распарсенный JSON", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ stateInstance: "authorized" }))

      const result = await greenApiGet<{ stateInstance: string }>(
        "getStateInstance",
        TEST_CREDS,
      )

      expect(result).toEqual({ stateInstance: "authorized" })
    })
  })

  describe("greenApiPost", () => {
    it("шлёт POST с JSON-телом и заголовком", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ idMessage: "1" }))

      await greenApiPost("sendMessage", TEST_CREDS, {
        chatId: "79990001122@c.us",
        message: "привет",
      })

      const [url, init] = fetchMock.mock.calls[0]!
      expect(url).toBe(`${BASE}/sendMessage/abc123`)
      expect(init?.method).toBe("POST")
      expect(init?.headers).toMatchObject({
        "Content-Type": "application/json",
      })
      expect(init?.body).toBe(
        JSON.stringify({ chatId: "79990001122@c.us", message: "привет" }),
      )
    })

    it("пробрасывает AbortSignal", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))
      const controller = new AbortController()

      await greenApiPost("sendMessage", TEST_CREDS, {}, controller.signal)

      const [, init] = fetchMock.mock.calls[0]!
      expect(init?.signal).toBe(controller.signal)
    })
  })

  describe("greenApiDelete", () => {
    it("шлёт DELETE с pathSuffix", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))

      await greenApiDelete("deleteNotification", TEST_CREDS, undefined, "/12345")

      const [url, init] = fetchMock.mock.calls[0]!
      expect(url).toBe(`${BASE}/deleteNotification/abc123/12345`)
      expect(init?.method).toBe("DELETE")
    })

    it("работает без pathSuffix", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))

      await greenApiDelete("deleteNotification", TEST_CREDS)

      const [url] = fetchMock.mock.calls[0]!
      expect(url).toBe(`${BASE}/deleteNotification/abc123`)
    })
  })

  describe("parseResponse", () => {
    it("кидает Error с message из JSON-ответа при !ok", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ message: "Instance not authorized" }, { status: 401 }),
      )

      await expect(greenApiGet("getStateInstance", TEST_CREDS)).rejects.toThrow(
        "Instance not authorized",
      )
    })

    it("кидает Error с текстом, если ответ — не JSON", async () => {
      fetchMock.mockResolvedValue(textResponse("Bad gateway", { status: 502 }))

      await expect(greenApiGet("getStateInstance", TEST_CREDS)).rejects.toThrow(
        "Bad gateway",
      )
    })

    it("кидает HTTP <status> если тело пустое и не ok", async () => {
      fetchMock.mockResolvedValue(new Response("", { status: 500 }))

      await expect(greenApiGet("getStateInstance", TEST_CREDS)).rejects.toThrow(
        "HTTP 500",
      )
    })

    it("возвращает null на пустом теле с ok", async () => {
      fetchMock.mockResolvedValue(new Response("", { status: 200 }))

      const result = await greenApiGet<null>("getStateInstance", TEST_CREDS)

      expect(result).toBeNull()
    })

    it("возвращает строку, если тело не JSON но ok", async () => {
      fetchMock.mockResolvedValue(textResponse("pong", { status: 200 }))

      const result = await greenApiGet<string>("ping", TEST_CREDS)

      expect(result).toBe("pong")
    })

    it("пробрасывает ошибки сети из fetch", async () => {
      fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))

      await expect(greenApiGet("getStateInstance", TEST_CREDS)).rejects.toThrow(
        "Failed to fetch",
      )
    })

    it("пробрасывает AbortError как есть", async () => {
      fetchMock.mockRejectedValue(new DOMException("aborted", "AbortError"))

      await expect(
        greenApiGet("getStateInstance", TEST_CREDS),
      ).rejects.toMatchObject({ name: "AbortError" })
    })
  })
})