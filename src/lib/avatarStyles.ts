export type AvatarStyle =
  | "initials"
  | "classic"
  | "cropped"
  | "curly"
  | "bun"
  | "waves"
  | "beanie"
  | "beret"
  | "scarf";

export const CHARACTER_STYLES: { key: Exclude<AvatarStyle, "initials">; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "cropped", label: "Cropped" },
  { key: "curly", label: "Curly" },
  { key: "bun", label: "Bun" },
  { key: "waves", label: "Waves" },
  { key: "beanie", label: "Beanie" },
  { key: "beret", label: "Beret" },
  { key: "scarf", label: "Scarf" },
];

export function isCharacterStyle(style: string): style is Exclude<AvatarStyle, "initials"> {
  return CHARACTER_STYLES.some((s) => s.key === style);
}
