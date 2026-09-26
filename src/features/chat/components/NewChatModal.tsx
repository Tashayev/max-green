import { useState } from "react";
import { X } from "lucide-react";
import type { Chat } from "../../../shared/types/common";

interface NewChatModalProps {
  onClose: () => void;
  onCreate: (chat: Chat) => void;
}

export function NewChatModal({
  onClose,
  onCreate,
}: NewChatModalProps) {
  const [phone, setPhone] = useState("");

  const submit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const digits = phone.replace(/\D/g, "");

    if (!digits) {
      return;
    }

    onCreate({
      id: `${digits}@c.us`,
      phone: `+${digits}`,
      displayName: phone.trim(),
    });
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <h2>Новый чат</h2>
            <p>
              Введите номер телефона
              получателя.
            </p>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Номер телефона
            <input
              autoFocus
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="+7 777 123 45 67"
            />
          </label>

          <div className="modal-hint">
            Номер преобразуется в chatId вида{" "}
            <code>номер@c.us</code>.
          </div>

          <button
            className="primary-button full"
            disabled={!phone.trim()}
          >
            Создать чат
          </button>
        </form>
      </div>
    </div>
  );
}