import { useState } from "react";
import {
  ArrowRight,
  KeyRound,
  MessageCircle,
} from "lucide-react";
import type { Credentials } from "../../../sheared/types/common";

interface SetupScreenProps {
  initialValues: Credentials;
  onSubmit: (credentials: Credentials) => void;
  error: string;
  loading: boolean;
}

export function SetupScreen({
  initialValues,
  onSubmit,
  error,
  loading,
}: SetupScreenProps) {
  const [form, setForm] =
    useState<Credentials>(initialValues);

  const submit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !form.idInstance.trim() ||
      !form.apiTokenInstance.trim()
    ) {
      return;
    }

    onSubmit(form);
  };

  return (
    <main className="setup-page">
      <section className="setup-card">
        <div className="brand-mark">
          <MessageCircle
            size={26}
            strokeWidth={2.2}
          />
        </div>

        <h1>MAX Chat</h1>

        <p className="setup-subtitle">
          Минимальный чат-интерфейс на
          React с интеграцией GREEN-API.
        </p>

        <form
          onSubmit={submit}
          className="setup-form"
        >
          <label>
            ID инстанса
            <input
              value={form.idInstance}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  idInstance:
                    event.target.value,
                }))
              }
              placeholder="Например, 1101234567"
              autoComplete="off"
            />
          </label>

          <label>
            API Token Instance

            <div className="input-with-icon">
              <KeyRound size={18} />

              <input
                value={form.apiTokenInstance}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    apiTokenInstance:
                      event.target.value,
                  }))
                }
                placeholder="Введите токен GREEN-API"
                type="password"
                autoComplete="off"
              />
            </div>
          </label>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={
              loading ||
              !form.idInstance.trim() ||
              !form.apiTokenInstance.trim()
            }
          >
            {loading
              ? "Подключение..."
              : "Подключиться"}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>
        </form>

        <div className="setup-note">
          Данные сохраняются только в
          localStorage браузера.
        </div>
      </section>
    </main>
  );
}