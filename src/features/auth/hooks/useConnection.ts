import { useState } from "react"
import { greenApi } from "../../../api/greenApi"
import { Credentials } from "../../../sheared/types/common"

export function useConnection() {
  const [setupError, setSetupError] = useState("")
  const [connecting, setConnecting] = useState(false)

  const connect = async (nextCredentials: Credentials) => {
    setConnecting(true)
    setSetupError("")

    const controller = new AbortController()

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

      setSetupError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось подключиться к GREEN-API.",
      )

      return false
    } finally {
      setConnecting(false)
    }
  }

  return {
    connect,
    setupError,
    connecting,
  }
}
