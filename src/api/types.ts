export interface GreenApiMessage {
  idMessage: string;
  typeMessage: string;
  timestamp: number;
  type: "incoming" | "outgoing";
  chatId: string;
  textMessage?: string;
  extendedTextMessage?: {
    text: string;
  };
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: GreenApiMessage;
}

export interface StateInstanceResponse {
  stateInstance: string;
}