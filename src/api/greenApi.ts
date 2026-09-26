import type { Credentials } from "../sheared/types/common"
import type {
  GreenApiMessage,
  ReceiveNotificationResponse,
  SendMessageResponse,
  StateInstanceResponse,
} from "./types"
import { greenApiDelete, greenApiGet, greenApiPost } from "./client"

export const greenApi = {
  getStateInstance(credentials: Credentials, signal?: AbortSignal) {
    return greenApiGet<StateInstanceResponse>(
      "getStateInstance",
      credentials,
      signal,
    )
  },

  configureHttpApi(credentials: Credentials, signal?: AbortSignal) {
    return greenApiPost(
      "setSettings",
      credentials,
      {
        webhookUrl: "",
        outgoingWebhook: "yes",
        stateWebhook: "yes",
        incomingWebhook: "yes",
      },
      signal,
    )
  },

  sendMessage(
    credentials: Credentials,
    chatId: string,
    message: string,
    signal?: AbortSignal,
  ) {
    return greenApiPost<SendMessageResponse>(
      "sendMessage",
      credentials,
      { chatId, message },
      signal,
    )
  },

  receiveNotification(
    credentials: Credentials,
    receiveTimeout = 5,
    signal?: AbortSignal,
  ) {
    const method = `receiveNotification?receiveTimeout=${receiveTimeout}`

    return greenApiGet<ReceiveNotificationResponse | null>(
      method,
      credentials,
      signal,
    )
  },

  deleteNotification(
    credentials: Credentials,
    receiptId: number,
    signal?: AbortSignal,
  ) {
    return greenApiDelete(
      "deleteNotification",
      credentials,
      signal,
      `/${receiptId}`,
    )
  },

  getChatHistory(
    credentials: Credentials,
    chatId: string,
    count = 100,
    signal?: AbortSignal,
  ) {
    return greenApiPost<GreenApiMessage[]>(
      "getChatHistory",
      credentials,
      { chatId, count },
      signal,
    )
  },
}
