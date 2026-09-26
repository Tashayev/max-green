import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  greenApiGet,
  greenApiPost,
  greenApiDelete,
} from "./client"
import type { Credentials } from "../sheared/types/common"

const creds: Credentials = {
  idInstance: "1101000000",
  apiTokenInstance: "abc123",
}

const jsonResponse = (
  body: unknown,
  init: ResponseInit = {}
): Response =>
  new Response(body === undefined ? "" : JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  })

const textResponse = (text: string, init: ResponseInit = {}): Response =>
  new Response(text, init)

describe("greenApiClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("greenApiGet", () => {
    it("собирает URL из метода и кредов", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ ok: true }))

      await greenApiGet("getStateInstance", creds)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe(
        "https://api.green-api.com/waInstance1101000000/getStateInstance/abc123"
      )
      expect(init).toEqual({ signal: undefined })
    })

    it("экранирует idInstance и apiTokenInstance", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))

      await greenApiGet("getStateInstance", {
        idInstance: "1 2/3",
        apiTokenInstance: "a&b=c",
      })

      const [url] = fetchMock.mock.calls[0]
      expect(url).toBe(
        "https://api.green-api.com/waInstance1%202%2F3/getStateInstance/a%26b%3Dc"
      )
    })

    it("добавляет query-параметры, если они есть в методе", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))

      await greenApiGet("getChatHistory?count=100", creds)

      const [url] = fetchMock.mock.calls[0]
      expect(url).toBe(
        "https://api.green-api.com/waInstance1101000000/getChatHistory/abc123?count=100"
      )
    })

    it("пробрасывает AbortSignal в fetch", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))
      const controller = new AbortController()

      await greenApiGet("getStateInstance", creds, controller.signal)

      const [, init] = fetchMock.mock.calls[0]
      expect(init.signal).toBe(controller.signal)
    })

    it("возвращает распарсенный JSON", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ stateInstance: "authorized" }))

      const result = await greenApiGet<{ stateInstance: string }>(
        "getStateInstance",
        creds
      )

      expect(result).toEqual({ stateInstance: "authorized" })
    })
  })

  describe("greenApiPost", () => {
    it("шлёт POST с JSON-телом и заголовком", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ idMessage: "1" }))

      await greenApiPost("sendMessage", creds, {
        chatId: "79990001122@c.us",
        message: "привет",
      })

      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe(
        "https://api.green-api.com/waInstance1101000000/sendMessage/abc123"
      )
      expect(init.method).toBe("POST")
      expect(init.headers).toEqual({ "Content-Type": "application/json" })
      expect(init.body).toBe(
        JSON.stringify({ chatId: "79990001122@c.us", message: "привет" })
      )
    })

    it("пробрасывает AbortSignal", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))
      const controller = new AbortController()

      await greenApiPost("sendMessage", creds, {}, controller.signal)

      const [, init] = fetchMock.mock.calls[0]
      expect(init.signal).toBe(controller.signal)
    })
  })

  describe("greenApiDelete", () => {
    it("шлёт DELETE с pathSuffix", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))

      await greenApiDelete(
        "deleteNotification",
        creds,
        undefined,
        "/12345"
      )

      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe(
        "https://api.green-api.com/waInstance1101000000/deleteNotification/abc123/12345"
      )
      expect(init.method).toBe("DELETE")
    })

    it("работает без pathSuffix", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}))

      await greenApiDelete("deleteNotification", creds)

      const [url] = fetchMock.mock.calls[0]
      expect(url).toBe(
        "https://api.green-api.com/waInstance1101000000/deleteNotification/abc123"
      )
    })
  })

  describe("parseResponse", () => {
    it("кидает Error с message из JSON-ответа при !ok", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ message: "Instance not authorized" }, { status: 401 })
      )

      await expect(greenApiGet("getStateInstance", creds)).rejects.toThrow(
        "Instance not authorized"
      )
    })

    it("кидает Error с текстом, если ответ — не JSON", async () => {
      fetchMock.mockResolvedValue(textResponse("Bad gateway", { status: 502 }))

      await expect(greenApiGet("getStateInstance", creds)).rejects.toThrow(
        "Bad gateway"
      )
    })

    it("кидает HTTP <status> если тело пустое и не ok", async () => {
      fetchMock.mockResolvedValue(new Response("", { status: 500 }))

      await expect(greenApiGet("getStateInstance", creds)).rejects.toThrow(
        "HTTP 500"
      )
    })

    it("возвращает null на пустом теле с ok", async () => {
      fetchMock.mockResolvedValue(new Response("", { status: 200 }))

      const result = await greenApiGet<null>("getStateInstance", creds)

      expect(result).toBeNull()
    })

    it("возвращает строку, если тело не JSON но ok", async () => {
      fetchMock.mockResolvedValue(textResponse("pong", { status: 200 }))

      const result = await greenApiGet<string>("ping", creds)

      expect(result).toBe("pong")
    })

    it("пробрасывает ошибки сети из fetch", async () => {
      fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))

      await expect(greenApiGet("getStateInstance", creds)).rejects.toThrow(
        "Failed to fetch"
      )
    })

    it("пробрасывает AbortError как есть", async () => {
      fetchMock.mockRejectedValue(new DOMException("aborted", "AbortError"))

      await expect(greenApiGet("getStateInstance", creds)).rejects.toMatchObject(
        { name: "AbortError" }
      )
    })
  })
})