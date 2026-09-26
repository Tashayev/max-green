import { useCallback, useEffect, useRef, useState } from "react"
import { greenApi } from "../../../api/greenApi"
import type { Credentials } from "../../../shared/types/common"

export function useConnection() {
  const [setupError, setSetupError] = useState("")
  const [connecting, setConnecting] = useState(false)

  const controllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      controllerRef.current?.abort()
    }
  }, [])

  const connect = useCallback(async (nextCredentials: Credentials) => {
    setConnecting(true)
    setSetupError("")

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      const state = await greenApi.getStateInstance(
        nextCredentials,
        controller.signal,
      )

      const stateInstance = state?.stateInstance

      if (stateInstance && !["authorized", "ready"].includes(stateInstance)) {
        throw new Error(
          `Инстанс не авторизован. Текущее состояние: ${stateInstance}`,
        )
      }

      await greenApi.configureHttpApi(nextCredentials, controller.signal)

      return true
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        return false
      }

      if (mountedRef.current) {
        setSetupError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось подключиться к GREEN-API.",
        )
      }

      return false
    } finally {
      if (mountedRef.current) {
        setConnecting(false)
      }
    }
  }, [])

  return {
    connect,
    setupError,
    connecting,
  }
}
