import {
  useCallback,
  useRef,
} from "react";

export function useTextSelection(
  value: string,
  onChange: (value: string) => void
) {
  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);

  const insertText = useCallback(
    (insertedText: string) => {
      const textarea = textareaRef.current;

      if (!textarea) {
        onChange(`${value}${insertedText}`);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const nextValue =
        value.slice(0, start) +
        insertedText +
        value.slice(end);

      onChange(nextValue);

      requestAnimationFrame(() => {
        textarea.focus();

        const cursorPosition =
          start + insertedText.length;

        textarea.setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      });
    },
    [value, onChange]
  );

  return {
    textareaRef,
    insertText,
  };
}