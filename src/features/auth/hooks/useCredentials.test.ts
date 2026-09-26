import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useCredentials } from "./useCredentials"
import { STORAGE_KEY } from "../../../sheared/constants/storageKeys"
import { TEST_CREDS, EMPTY_CREDS } from "../../../tests/fixtures"

describe("useCredentials", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it("на старте возвращает null и пустой draft, если в хранилище пусто", () => {
    const { result } = renderHook(() => useCredentials())

    expect(result.current.credentials).toBeNull()
    expect(result.current.draft).toEqual(EMPTY_CREDS)
  })

  it("читает credentials из localStorage при инициализации", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(TEST_CREDS))

    const { result } = renderHook(() => useCredentials())

    expect(result.current.credentials).toEqual(TEST_CREDS)
    expect(result.current.draft).toEqual(TEST_CREDS)
  })

  it("возвращает null если в хранилище лежит битый JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{ not json")

    const { result } = renderHook(() => useCredentials())

    expect(result.current.credentials).toBeNull()
    expect(result.current.draft).toEqual(EMPTY_CREDS)
  })

  it("возвращает null если JSON не соответствует Credentials", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ idInstance: 1101000000, apiTokenInstance: null }),
    )

    const { result } = renderHook(() => useCredentials())

    expect(result.current.credentials).toBeNull()
    expect(result.current.draft).toEqual(EMPTY_CREDS)
  })

  it("save обрезает пробелы и пишет в localStorage", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem")

    const { result } = renderHook(() => useCredentials())

    act(() => {
      result.current.save({
        idInstance: "  1101000000  ",
        apiTokenInstance: "  abc123  ",
      })
    })

    expect(result.current.credentials).toEqual(TEST_CREDS)
    expect(result.current.draft).toEqual(TEST_CREDS)
    expect(setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(TEST_CREDS),
    )
  })

  it("clear чистит состояние и localStorage", () => {
    const removeItem = vi.spyOn(Storage.prototype, "removeItem")
    localStorage.setItem(STORAGE_KEY, JSON.stringify(TEST_CREDS))

    const { result } = renderHook(() => useCredentials())
    expect(result.current.credentials).toEqual(TEST_CREDS)

    act(() => {
      result.current.clear()
    })

    expect(result.current.credentials).toBeNull()
    expect(result.current.draft).toEqual(EMPTY_CREDS)
    expect(removeItem).toHaveBeenCalledWith(STORAGE_KEY)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it("setDraft меняет только draft, не трогая credentials и storage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(TEST_CREDS))
    const setItem = vi.spyOn(Storage.prototype, "setItem")

    const { result } = renderHook(() => useCredentials())

    act(() => {
      result.current.setDraft({
        idInstance: "999",
        apiTokenInstance: "new",
      })
    })

    expect(result.current.draft).toEqual({
      idInstance: "999",
      apiTokenInstance: "new",
    })
    expect(result.current.credentials).toEqual(TEST_CREDS)
    expect(setItem).not.toHaveBeenCalled()
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(TEST_CREDS))
  })

  it("save пробрасывает ошибку если localStorage недоступен", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded")
    })

    const { result } = renderHook(() => useCredentials())

    expect(() => {
      act(() => {
        result.current.save(TEST_CREDS)
      })
    }).toThrow("QuotaExceeded")
  })
})