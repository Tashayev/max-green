import { useCallback, useState } from "react"
import type { Credentials } from "../../../sheared/types/common"
import { STORAGE_KEY } from "../../../sheared/constants/storageKeys"

const EMPTY_CREDENTIALS: Credentials = {
  idInstance: "",
  apiTokenInstance: "",
}

function isCredentials(value: unknown): value is Credentials {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.idInstance === "string" &&
    typeof candidate.apiTokenInstance === "string"
  )
}

function readStored(): Credentials | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)

    if (!value) {
      return null
    }

    const parsed: unknown = JSON.parse(value)

    return isCredentials(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credentials | null>(readStored)

  const [draft, setDraft] = useState<Credentials>(
    credentials ?? EMPTY_CREDENTIALS,
  )

  const save = useCallback((next: Credentials) => {
    const clean: Credentials = {
      idInstance: next.idInstance.trim(),
      apiTokenInstance: next.apiTokenInstance.trim(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
    setCredentials(clean)
    setDraft(clean)
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCredentials(null)
    setDraft(EMPTY_CREDENTIALS)
  }, [])

  return {
    credentials,
    draft,
    setDraft,
    save,
    clear,
  }
}