import {
  useEffect,
  type RefObject,
} from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void
) {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        ref.current &&
        target instanceof Node &&
        !ref.current.contains(target)
      ) {
        onOutside();
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [ref, onOutside]);
}