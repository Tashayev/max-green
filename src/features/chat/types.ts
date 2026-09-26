export type EmojiCategory =
  | "smileys"
  | "gestures"
  | "symbols";

export interface Emoji {
  value: string;
  category: EmojiCategory;
  name: string;
}