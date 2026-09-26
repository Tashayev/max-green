import { Chat } from "../../types/common"
import { CHAT_STORAGE_KEY } from "../../constants/storageKeys"

export function readStoredChat(): Chat | null {
  try {
    const value = localStorage.getItem(CHAT_STORAGE_KEY)

    return value ? (JSON.parse(value) as Chat) : null
  } catch {
    return null
  }
}