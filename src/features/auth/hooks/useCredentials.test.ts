import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useCredentials } from "./useCredentials"
import { STORAGE_KEY } from "../../../sheared/constants/storageKeys"
import type { Credentials } from "../../../sheared/types/common"

const creds: Credentials = {
  idInstance: "1101000000",
  apiTokenInstance: "abc123",
}

describe("useCredentials", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("на старте возвращает null и пустой draft, если в хранилище пусто", () => {
    const { result } = renderHook(() => useCredentials())

    expect(result.current.credentials).toBeNull()
    expect(result.current.draft).toEqual({
      idInstance: "",
      apiTokenInstance: "",
    })
  })

  it("читает credentials из localStorage при инициализации", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds))

    const { result } = renderHook(() => useCredentials())

    expect(result.current.credentials).toEqual(creds)
    expect(result.current.draft).toEqual(creds)
  })

  it("возвращает null если в хранилище лежит битый JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{ not json")

    const { result } = renderHook(() => useCredentials())

    expect(result.current.credentials).toBeNull()
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

    expect(result.current.credentials).toEqual(creds)
    expect(result.current.draft).toEqual(creds)
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(creds))
  })

  it("clear чистит состояние и localStorage", () => {
    const removeItem = vi.spyOn(Storage.prototype, "removeItem")
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds))

    const { result } = renderHook(() => useCredentials())
    expect(result.current.credentials).toEqual(creds)

    act(() => {
      result.current.clear()
    })

    expect(result.current.credentials).toBeNull()
    expect(result.current.draft).toEqual({
      idInstance: "",
      apiTokenInstance: "",
    })
    expect(removeItem).toHaveBeenCalledWith(STORAGE_KEY)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it("setDraft меняет только draft, не трогая credentials и storage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds))

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
    expect(result.current.credentials).toEqual(creds)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(creds))
  })

  it("save не падает если localStorage кидает исключение", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded")
    })

    const { result } = renderHook(() => useCredentials())

    expect(() => {
      act(() => {
        result.current.save(creds)
      })
    }).toThrow("QuotaExceeded")
  })
})