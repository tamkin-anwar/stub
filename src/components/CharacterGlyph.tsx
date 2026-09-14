import type { AvatarStyle } from "../lib/avatarStyles";

const INK = "#f8f3ec";

/** Everything above the shoulders varies by style; the bust below it is shared,
 *  so every character reads as one consistent flat-silhouette family (the
 *  same idea as a Saul Bass poster cutout: one colour, the outline does the
 *  work) rather than a set of unrelated cartoon faces. */
const HEADS: Record<Exclude<AvatarStyle, "initials">, JSX.Element> = {
  classic: <circle cx="24" cy="17" r="9" fill={INK} />,
  cropped: (
    <>
      <circle cx="24" cy="17" r="9" fill={INK} />
      <path
        d="M15.4 13.6C16.8 9.6 20.1 7 24 7C27.9 7 31.2 9.6 32.6 13.6C30 12.1 27.2 11.3 24 11.3C20.8 11.3 18 12.1 15.4 13.6Z"
        fill={INK}
      />
    </>
  ),
  curly: (
    <>
      <circle cx="24" cy="17" r="9" fill={INK} />
      <circle cx="16.2" cy="12.4" r="3" fill={INK} />
      <circle cx="19.6" cy="8.4" r="3" fill={INK} />
      <circle cx="24" cy="7.3" r="3.2" fill={INK} />
      <circle cx="28.4" cy="8.4" r="3" fill={INK} />
      <circle cx="31.8" cy="12.4" r="3" fill={INK} />
    </>
  ),
  bun: (
    <>
      <circle cx="24" cy="17" r="9" fill={INK} />
      <rect x="22.6" y="7.2" width="2.8" height="3.6" fill={INK} />
      <circle cx="24" cy="6.2" r="3.2" fill={INK} />
    </>
  ),
  waves: (
    <path
      d="M14.2 15C14.2 10 18 6 24 6C30 6 33.8 10 33.8 15C33.8 19 32 22 30.5 24C31.8 27 32.2 30 31.5 33C29 31 27.7 28.5 27.3 25.8C26.2 26.3 25.1 26.5 24 26.5C22.9 26.5 21.8 26.3 20.7 25.8C20.3 28.5 19 31 16.5 33C15.8 30 16.2 27 17.5 24C16 22 14.2 19 14.2 15Z"
      fill={INK}
    />
  ),
  beanie: (
    <>
      <path
        d="M13.5 18.2C13.5 11.1 18.2 5.6 24 5.6C29.8 5.6 34.5 11.1 34.5 18.2C34.5 19 34.4 19.7 34.3 20.4H13.7C13.6 19.7 13.5 19 13.5 18.2Z"
        fill={INK}
      />
      <rect x="13.4" y="19.6" width="21.2" height="2.6" rx="1.3" fill={INK} />
      <circle cx="24" cy="4.6" r="2" fill={INK} />
    </>
  ),
  beret: (
    <>
      <circle cx="24" cy="17" r="9" fill={INK} />
      <ellipse cx="22" cy="9" rx="11" ry="6" transform="rotate(-12 22 9)" fill={INK} />
      <circle cx="31.5" cy="5.4" r="1.6" fill={INK} />
    </>
  ),
  scarf: (
    <>
      <circle cx="24" cy="17" r="10.4" fill={INK} />
      <path
        d="M31.4 23.6C33.4 25.7 34.8 28.7 34.2 31.8C32.2 30.2 30.1 27.6 29 24.8C29.8 24.4 30.6 24 31.4 23.6Z"
        fill={INK}
      />
    </>
  ),
};

export function CharacterGlyph({ style }: { style: Exclude<AvatarStyle, "initials"> }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
      <path d="M14 48C14 38.06 18.03 32 24 32C29.97 32 34 38.06 34 48H14Z" fill={INK} />
      <rect x="21" y="23.5" width="6" height="8.5" rx="2" fill={INK} />
      {HEADS[style]}
    </svg>
  );
}
