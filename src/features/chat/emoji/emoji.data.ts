import type { Emoji, EmojiCategory } from "../types";

export const EMOJI_CATEGORIES: Array<{
  id: EmojiCategory;
  label: string;
}> = [
  { id: "smileys", label: "Смайлики" },
  { id: "gestures", label: "Жесты" },
  { id: "symbols", label: "Символы" },
];

export const EMOJIS: Emoji[] = [
  { value: "😀", category: "smileys", name: "grinning" },
  { value: "😃", category: "smileys", name: "smiley" },
  { value: "😄", category: "smileys", name: "smile" },
  { value: "😁", category: "smileys", name: "grin" },
  { value: "😆", category: "smileys", name: "laughing" },
  { value: "😅", category: "smileys", name: "sweat smile" },
  { value: "😂", category: "smileys", name: "joy" },
  { value: "🤣", category: "smileys", name: "rofl" },
  { value: "😊", category: "smileys", name: "blush" },
  { value: "😇", category: "smileys", name: "innocent" },
  { value: "🙂", category: "smileys", name: "slightly smiling" },
  { value: "🙃", category: "smileys", name: "upside down" },
  { value: "😉", category: "smileys", name: "wink" },
  { value: "😍", category: "smileys", name: "heart eyes" },
  { value: "🥰", category: "smileys", name: "smiling hearts" },
  { value: "😘", category: "smileys", name: "kissing" },
  { value: "😎", category: "smileys", name: "sunglasses" },
  { value: "🤔", category: "smileys", name: "thinking" },
  { value: "😐", category: "smileys", name: "neutral" },
  { value: "🙄", category: "smileys", name: "roll eyes" },
  { value: "😏", category: "smileys", name: "smirk" },
  { value: "😢", category: "smileys", name: "cry" },
  { value: "😭", category: "smileys", name: "sob" },
  { value: "😡", category: "smileys", name: "angry" },
  { value: "🤬", category: "smileys", name: "cursing" },
  { value: "😱", category: "smileys", name: "scream" },
  { value: "😴", category: "smileys", name: "sleeping" },
  { value: "🤗", category: "smileys", name: "hugging" },
  { value: "🤩", category: "smileys", name: "star struck" },

  { value: "👍", category: "gestures", name: "thumbs up" },
  { value: "👎", category: "gestures", name: "thumbs down" },
  { value: "👏", category: "gestures", name: "clap" },
  { value: "🙌", category: "gestures", name: "raised hands" },
  { value: "🙏", category: "gestures", name: "pray" },
  { value: "💪", category: "gestures", name: "muscle" },
  { value: "👋", category: "gestures", name: "wave" },
  { value: "👌", category: "gestures", name: "ok" },
  { value: "✌️", category: "gestures", name: "victory" },
  { value: "🤝", category: "gestures", name: "handshake" },
  { value: "👀", category: "gestures", name: "eyes" },

  { value: "❤️", category: "symbols", name: "heart" },
  { value: "🔥", category: "symbols", name: "fire" },
  { value: "💯", category: "symbols", name: "hundred" },
  { value: "✨", category: "symbols", name: "sparkles" },
  { value: "🎉", category: "symbols", name: "party" },
  { value: "🚀", category: "symbols", name: "rocket" },
  { value: "⭐", category: "symbols", name: "star" },
  { value: "✅", category: "symbols", name: "check" },
  { value: "❌", category: "symbols", name: "cross" },
];