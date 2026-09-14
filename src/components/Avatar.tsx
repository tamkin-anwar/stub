import { initials } from "../lib/format";
import { isCharacterStyle } from "../lib/avatarStyles";
import { CharacterGlyph } from "./CharacterGlyph";

const ACCENTS: Record<string, string> = {
  amber: "#c9822f",
  teal: "#2f8f8f",
  plum: "#7a4b8f",
  moss: "#5c7a3f",
  slate: "#4d6072",
  brick: "#a5482f",
};

export function Avatar({
  name,
  accent = "amber",
  avatarStyle = "initials",
  size = "sm",
}: {
  name: string;
  accent?: string;
  avatarStyle?: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={`avatar${size === "lg" ? " lg" : ""}`}
      style={{ background: ACCENTS[accent] ?? ACCENTS.amber }}
      aria-hidden
    >
      {isCharacterStyle(avatarStyle) ? <CharacterGlyph style={avatarStyle} /> : initials(name)}
    </span>
  );
}
