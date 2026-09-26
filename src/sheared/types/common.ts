export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface Chat {
  id: string;
  phone: string;
  displayName: string;
}

export type MessageDirection = "incoming" | "outgoing";

export type MessageStatus = "sending" | "sent" | "failed";

export interface Message {
  id: string;
  text: string;
  direction: MessageDirection;
  timestamp: number;
  status: MessageStatus;
}