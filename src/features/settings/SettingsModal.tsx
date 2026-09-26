import { X } from "lucide-react";
import type { Credentials } from "../../shared/types/common";

interface SettingsModalProps {
  credentials: Credentials;
  onClose: () => void;
  onLogout: () => void;
}

export function SettingsModal({
  credentials,
  onClose,
  onLogout,
}: SettingsModalProps) {
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
            <h2>
              Настройки подключения
            </h2>
            <p>
              Текущие учетные данные
              GREEN-API.
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

        <div className="settings-list">
          <div>
            <span>ID инстанса</span>
            <strong>
              {credentials.idInstance}
            </strong>
          </div>

          <div>
            <span>API Token Instance</span>
            <strong>
              {mask(credentials.apiTokenInstance)}
            </strong>
          </div>

          <div>
            <span>
              Получение сообщений
            </span>
            <strong>
              HTTP API / long polling
            </strong>
          </div>
        </div>

        <button
          className="secondary-button full"
          onClick={onLogout}
        >
          Выйти и удалить сохраненные
          данные
        </button>
      </div>
    </div>
  );
}

function mask(value: string) {
  if (value.length <= 8) {
    return "••••••••";
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}