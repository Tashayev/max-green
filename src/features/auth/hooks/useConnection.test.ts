import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useConnection } from "./useConnection"
import { API, CREDS } from "../../../tests/mocks"

vi.mock("../../../api/greenApi", () => ({
  greenApi: {
    getStateInstance: vi.fn(),
    configureHttpApi: vi.fn(),
  },
}))



describe("useConnection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("коннектится когда инстанс authorized", async () => {
    API.getStateInstance.mockResolvedValue({ stateInstance: "authorized" })
    API.configureHttpApi.mockResolvedValue(undefined)

    const { result } = renderHook(() => useConnection())

    let ok = false
    await act(async () => {
      ok = await result.current.connect(CREDS)
    })

    expect(ok).toBe(true)
    expect(result.current.setupError).toBe("")
    expect(API.configureHttpApi).toHaveBeenCalled()
  })

  it("коннектится когда инстанс ready", async () => {
    API.getStateInstance.mockResolvedValue({ stateInstance: "ready" })
    API.configureHttpApi.mockResolvedValue(undefined)

    const { result } = renderHook(() => useConnection())

    let ok = false
    await act(async () => {
      ok = await result.current.connect(CREDS)
    })

    expect(ok).toBe(true)
  })

  it("не коннектится если инстанс не авторизован", async () => {
    API.getStateInstance.mockResolvedValue({ stateInstance: "notAuthorized" })

    const { result } = renderHook(() => useConnection())

    let ok = false
    await act(async () => {
      ok = await result.current.connect(CREDS)
    })

    expect(ok).toBe(false)
    expect(result.current.setupError).toMatch(/notAuthorized/)
    expect(API.configureHttpApi).not.toHaveBeenCalled()
  })

  it("сохраняет текст ошибки из исключения", async () => {
    API.getStateInstance.mockRejectedValue(new Error("сеть легла"))

    const { result } = renderHook(() => useConnection())

    await act(async () => {
      await result.current.connect(CREDS)
    })

    expect(result.current.setupError).toBe("сеть легла")
  })

  it("ставит дефолтную ошибку если упало не Error", async () => {
    API.getStateInstance.mockRejectedValue("strange")

    const { result } = renderHook(() => useConnection())

    await act(async () => {
      await result.current.connect(CREDS)
    })

    expect(result.current.setupError).toBe(
      "Не удалось подключиться к GREEN-API.",
    )
  })

  it("не пишет ошибку при AbortError", async () => {
    API.getStateInstance.mockRejectedValue(
      new DOMException("aborted", "AbortError"),
    )

    const { result } = renderHook(() => useConnection())

    let ok = false
    await act(async () => {
      ok = await result.current.connect(CREDS)
    })

    expect(ok).toBe(false)
    expect(result.current.setupError).toBe("")
  })

  it("сбрасывает старую ошибку при повторном коннекте", async () => {
    API.getStateInstance.mockRejectedValueOnce(new Error("fail"))

    const { result } = renderHook(() => useConnection())

    await act(async () => {
      await result.current.connect(CREDS)
    })

    expect(result.current.setupError).toBe("fail")

    API.getStateInstance.mockResolvedValueOnce({
      stateInstance: "authorized",
    })
    API.configureHttpApi.mockResolvedValue(undefined)

    await act(async () => {
      await result.current.connect(CREDS)
    })

    expect(result.current.setupError).toBe("")
  })

  it("переключает connecting туда-обратно", async () => {
    let resolve!: (value: { stateInstance: "authorized" }) => void

    API.getStateInstance.mockImplementation(
      () =>
        new Promise<{ stateInstance: "authorized" }>((promiseResolve) => {
          resolve = promiseResolve
        }),
    )
    API.configureHttpApi.mockResolvedValue(undefined)

    const { result } = renderHook(() => useConnection())

    let connectionPromise: Promise<boolean>

    act(() => {
      connectionPromise = result.current.connect(CREDS)
    })

    expect(result.current.connecting).toBe(true)

    await act(async () => {
      resolve({ stateInstance: "authorized" })
      await connectionPromise
    })

    expect(result.current.connecting).toBe(false)
  })
})