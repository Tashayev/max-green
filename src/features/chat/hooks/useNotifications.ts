import {
  useEffect,
  useRef,
} from "react";
import { greenApi } from "../../../api/greenApi";
import type {
  Credentials,
  Message,
} from "../../../shared/types/common";
import { mapGreenApiMessage } from "../utils/messageMappers";

interface UseNotificationsOptions {
  credentials: Credentials | null;
  activeChatId: string | null;
  onMessage: (message: Message) => void;
  onError?: (message: string) => void;
}

export function useNotifications({
  credentials,
  activeChatId,
  onMessage,
  onError,
}: UseNotificationsOptions) {
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!credentials) {
      return;
    }

    const controller = new AbortController();

    const poll = async (): Promise<void> => {
      if (controller.signal.aborted) {
        return;
      }

      try {
        const notification =
          await greenApi.receiveNotification(
            credentials,
            5,
            controller.signal
          );

        if (notification?.receiptId) {
          const message = mapGreenApiMessage(
            notification.body
          );

          if (
            message &&
            message.direction === "incoming" &&
            notification.body.chatId === activeChatId
          ) {
            onMessageRef.current(message);
          }

          await greenApi.deleteNotification(
            credentials,
            notification.receiptId,
            controller.signal
          );
        }
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        onErrorRef.current?.(
          requestError instanceof Error
            ? requestError.message
            : "Ошибка получения уведомлений."
        );
      }

      if (!controller.signal.aborted) {
        window.setTimeout(poll, 100);
      }
    };

    void poll();

    return () => {
      controller.abort();
    };
  }, [credentials, activeChatId]);
}