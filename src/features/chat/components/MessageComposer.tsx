import {
  useCallback,
  useState,
} from "react";
import { LoaderCircle, Send } from "lucide-react";
import { EmojiPicker } from "./";
import { useTextSelection } from "../hooks";

interface MessageComposerProps {
  value: string;
  disabled?: boolean;
  sending?: boolean;
  maxLength?: number;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function MessageComposer({
  value,
  disabled = false,
  sending = false,
  maxLength = 4000,
  onChange,
  onSend,
}: MessageComposerProps) {
  const [isFocused, setIsFocused] =
    useState(false);

  const {
    textareaRef,
    insertText,
  } = useTextSelection(value, onChange);

  const handleChange = useCallback(
    (nextValue: string) => {
      if (nextValue.length <= maxLength) {
        onChange(nextValue);
      }
    },
    [maxLength, onChange]
  );

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (value.trim() && !disabled && !sending) {
        onSend();
      }
    }
  };

  return (
    <form
      className={`composer ${
        isFocused ? "composer-focused" : ""
      }`}
      onSubmit={(event) => {
        event.preventDefault();

        if (
          value.trim() &&
          !disabled &&
          !sending
        ) {
          onSend();
        }
      }}
    >
      <EmojiPicker onSelect={insertText} />

      <textarea
        ref={textareaRef}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        rows={1}
        placeholder="Напишите сообщение..."
        aria-label="Текст сообщения"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(event) =>
          handleChange(event.target.value)
        }
        onKeyDown={handleKeyDown}
      />

      <span className="counter">
        {value.length}/{maxLength}
      </span>

      <button
        type="submit"
        className="send-button"
        disabled={
          !value.trim() ||
          disabled ||
          sending
        }
        aria-label="Отправить сообщение"
      >
        {sending ? (
          <LoaderCircle
            size={20}
            className="spin"
          />
        ) : (
          <Send size={20} />
        )}
      </button>
    </form>
  );
}