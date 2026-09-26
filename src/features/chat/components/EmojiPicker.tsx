import {
  useMemo,
  useRef,
  useState,
} from "react";
import { Smile } from "lucide-react";
import { EMOJI_CATEGORIES, EMOJIS } from "../emoji/emoji.data";
import type { EmojiCategory } from "../types";
import { useClickOutside } from "../../../sheared/hooks/useClickOutside";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({
  onSelect,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] =
    useState<EmojiCategory>("smileys");

  const wrapperRef =
    useRef<HTMLDivElement | null>(null);

  useClickOutside(wrapperRef, () => setOpen(false));

  const visibleEmojis = useMemo(
    () =>
      EMOJIS.filter(
        (emoji) => emoji.category === category
      ),
    [category]
  );

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <div
      className="emoji-picker-wrapper"
      ref={wrapperRef}
    >
      <button
        type="button"
        className={`composer-icon ${
          open ? "composer-icon-active" : ""
        }`}
        title="Добавить emoji"
        aria-label="Добавить emoji"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Smile size={21} />
      </button>

      {open && (
        <div
          className="emoji-picker"
          role="dialog"
          aria-label="Выбор emoji"
        >
          <div className="emoji-picker-header">
            <span>Emoji</span>
          </div>

          <div className="emoji-categories">
            {EMOJI_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  category === item.id
                    ? "emoji-category active"
                    : "emoji-category"
                }
                onClick={() =>
                  setCategory(item.id)
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="emoji-grid">
            {visibleEmojis.map((emoji) => (
              <button
                key={emoji.name}
                type="button"
                className="emoji-button"
                title={emoji.name}
                aria-label={emoji.name}
                onClick={() =>
                  handleSelect(emoji.value)
                }
              >
                {emoji.value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}