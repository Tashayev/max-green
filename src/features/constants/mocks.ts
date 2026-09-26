import { vi } from "vitest"
import { Credentials } from "../../sheared/types/common"
import { greenApi } from "../../api/greenApi"
import { GreenApiMessage } from "../../api/types"

export const API = vi.mocked(greenApi)

export const CREDS: Credentials = {
  idInstance: "1101000000",
  apiTokenInstance: "abc123",
}

export const CHAT_ID = "79990001122@c.us"
