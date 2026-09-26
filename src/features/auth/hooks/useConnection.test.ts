import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useConnection } from "./useConnection"
import { MOCK_API } from "../../../tests/mocks"
import { TEST_CREDS } from "../../../tests/fixtures"

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
    MOCK_API.getStateInstance.mockResolvedValue({ stateInstance: "authorized" })
    MOCK_API.configureHttpApi.mockResolvedValue(undefined)

    const { result } = renderHook(() => useConnection())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.connect(TEST_CREDS)
    })

    expect(ok).toBe(true)
    expect(result.current.setupError).toBe("")
    expect(result.current.connecting).toBe(false)
    expect(MOCK_API.configureHttpApi).toHaveBeenCalledWith(TEST_CREDS)
  })

  it("коннектится когда инстанс ready", async () => {
    MOCK_API.getStateInstance.mockResolvedValue({ stateInstance: "ready" })
    MOCK_API.configureHttpApi.mockResolvedValue(undefined)

    const { result } = renderHook(() => useConnection())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.connect(TEST_CREDS)
    })

    expect(ok).toBe(true)
  })

  it("не коннектится если инстанс не авторизован", async () => {
    MOCK_API.getStateInstance.mockResolvedValue({
      stateInstance: "notAuthorized",
    })

    const { result } = renderHook(() => useConnection())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.connect(TEST_CREDS)
    })

    expect(ok).toBe(false)
    expect(result.current.setupError).toMatch(/notAuthorized/)
    expect(result.current.connecting).toBe(false)
    expect(MOCK_API.configureHttpApi).not.toHaveBeenCalled()
  })

  it("сохраняет текст ошибки из исключения", async () => {
    MOCK_API.getStateInstance.mockRejectedValue(new Error("сеть легла"))

    const { result } = renderHook(() => useConnection())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.connect(TEST_CREDS)
    })

    expect(ok).toBe(false)
    expect(result.current.setupError).toBe("сеть легла")
    expect(result.current.connecting).toBe(false)
  })

  it("ставит дефолтную ошибку если упало не Error", async () => {
    MOCK_API.getStateInstance.mockRejectedValue("strange")

    const { result } = renderHook(() => useConnection())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.connect(TEST_CREDS)
    })

    expect(ok).toBe(false)
    expect(result.current.setupError).toBe(
      "Не удалось подключиться к GREEN-API.",
    )
  })

  it("не пишет ошибку при AbortError", async () => {
    MOCK_API.getStateInstance.mockRejectedValue(
      new DOMException("aborted", "AbortError"),
    )

    const { result } = renderHook(() => useConnection())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.connect(TEST_CREDS)
    })

    expect(ok).toBe(false)
    expect(result.current.setupError).toBe("")
  })

  it("сбрасывает старую ошибку при повторном коннекте", async () => {
    MOCK_API.getStateInstance.mockRejectedValueOnce(new Error("fail"))

    const { result } = renderHook(() => useConnection())

    await act(async () => {
      await result.current.connect(TEST_CREDS)
    })

    expect(result.current.setupError).toBe("fail")

    MOCK_API.getStateInstance.mockResolvedValueOnce({
      stateInstance: "authorized",
    })
    MOCK_API.configureHttpApi.mockResolvedValue(undefined)

    await act(async () => {
      await result.current.connect(TEST_CREDS)
    })

    expect(result.current.setupError).toBe("")
  })

  it("переключает connecting туда-обратно", async () => {
    let resolve!: (value: { stateInstance: "authorized" }) => void

    MOCK_API.getStateInstance.mockImplementation(
      () =>
        new Promise<{ stateInstance: "authorized" }>((promiseResolve) => {
          resolve = promiseResolve
        }),
    )
    MOCK_API.configureHttpApi.mockResolvedValue(undefined)

    const { result } = renderHook(() => useConnection())

    let connectionPromise!: Promise<boolean>

    act(() => {
      connectionPromise = result.current.connect(TEST_CREDS)
    })

    expect(result.current.connecting).toBe(true)

    await act(async () => {
      resolve({ stateInstance: "authorized" })
      await connectionPromise
    })

    expect(result.current.connecting).toBe(false)
  })
})
