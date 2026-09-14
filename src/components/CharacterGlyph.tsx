import type { AvatarStyle } from "../lib/avatarStyles";

const SKIN = "#e8c39e";
const GARMENT = "#3b3129";
const INK = "#2a2018";
const OUTLINE = "#f8f3ec";

const DARK_BROWN = "#4a3527";
const BLACK = "#1f1a15";
const AUBURN = "#7a3b23";
const BLONDE = "#cfa15c";
const WOOL = "#7a3b3f";
const BERET = "#6b2c39";
const FRAME = "#2f6b6b";

const S = { stroke: OUTLINE, strokeWidth: 1, strokeLinejoin: "round" as const };

function Face() {
  return (
    <>
      <ellipse cx="20.6" cy="17.2" rx="1.1" ry="1.4" fill={INK} />
      <ellipse cx="27.4" cy="17.2" rx="1.1" ry="1.4" fill={INK} />
      <path d="M20.8 21.3C21.9 22.6 26.1 22.6 27.2 21.3" stroke={INK} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </>
  );
}

/** Hair/hat pieces drawn behind the head circle: only what pokes out past
 *  its silhouette (a lobe of hair beside the face, a rim of wrapped scarf)
 *  reads, the same way real hair frames a face rather than covering it. */
const BACK: Partial<Record<Exclude<AvatarStyle, "initials">, JSX.Element>> = {
  waves: (
    <>
      <path
        d="M23 6.5C16 6.5 11 11.5 11 17.5C11 22.5 13 27.5 16 32C15 27 14.5 22 15.5 17.5C13.5 15.5 13 12 15 9.5C17.5 7 20 6.5 23 6.5Z"
        fill={BLONDE}
        {...S}
      />
      <path
        d="M25 6.5C32 6.5 37 11.5 37 17.5C37 22.5 35 27.5 32 32C33 27 33.5 22 32.5 17.5C34.5 15.5 35 12 33 9.5C30.5 7 28 6.5 25 6.5Z"
        fill={BLONDE}
        {...S}
      />
    </>
  ),
};

/** Hair/hat pieces drawn in front, sitting above the eye line so the face
 *  underneath always stays fully visible. */
const FRONT: Partial<Record<Exclude<AvatarStyle, "initials">, JSX.Element>> = {
  cropped: (
    <path
      d="M15.4 13.6C16.8 9.6 20.1 7 24 7C27.9 7 31.2 9.6 32.6 13.6C30 12.1 27.2 11.3 24 11.3C20.8 11.3 18 12.1 15.4 13.6Z"
      fill={DARK_BROWN}
      {...S}
    />
  ),
  curly: (
    <>
      <circle cx="16.3" cy="12.2" r="3" fill={BLACK} {...S} />
      <circle cx="19.6" cy="8.3" r="3" fill={BLACK} {...S} />
      <circle cx="24" cy="7.2" r="3.2" fill={BLACK} {...S} />
      <circle cx="28.4" cy="8.3" r="3" fill={BLACK} {...S} />
      <circle cx="31.7" cy="12.2" r="3" fill={BLACK} {...S} />
    </>
  ),
  bun: (
    <>
      <rect x="22.6" y="7.2" width="2.8" height="3.6" fill={AUBURN} {...S} />
      <circle cx="24" cy="6.2" r="3.2" fill={AUBURN} {...S} />
      <path
        d="M15.6 13.2C17 9.4 20.2 7 24 7C27.8 7 31 9.4 32.4 13.2C29.9 11.9 27.1 11.2 24 11.2C20.9 11.2 18.1 11.9 15.6 13.2Z"
        fill={AUBURN}
        {...S}
      />
    </>
  ),
  beanie: (
    <>
      <path
        d="M13.7 14.6C13.7 8.7 18.3 4.4 24 4.4C29.7 4.4 34.3 8.7 34.3 14.6C34.3 15.2 34.2 15.8 34.1 16.4H13.9C13.8 15.8 13.7 15.2 13.7 14.6Z"
        fill={WOOL}
        {...S}
      />
      <rect x="13.6" y="15.6" width="20.8" height="2.4" rx="1.2" fill={WOOL} {...S} />
      <circle cx="24" cy="3.4" r="2" fill={WOOL} {...S} />
    </>
  ),
  beret: (
    <>
      <ellipse cx="22" cy="8.4" rx="11" ry="6" transform="rotate(-12 22 8.4)" fill={BERET} {...S} />
      <circle cx="31.5" cy="4.8" r="1.6" fill={BERET} {...S} />
    </>
  ),
  glasses: (
    <>
      <circle cx="20.4" cy="17.2" r="3.1" fill="none" stroke={FRAME} strokeWidth="1.4" />
      <circle cx="27.6" cy="17.2" r="3.1" fill="none" stroke={FRAME} strokeWidth="1.4" />
      <path d="M23.3 17.2H24.7" stroke={FRAME} strokeWidth="1.4" />
      <path d="M17.3 16.6L15.2 15.6" stroke={FRAME} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M30.7 16.6L32.8 15.6" stroke={FRAME} strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
};

export function CharacterGlyph({ style }: { style: Exclude<AvatarStyle, "initials"> }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
      <path d="M14 48C14 38.06 18.03 32 24 32C29.97 32 34 38.06 34 48H14Z" fill={GARMENT} {...S} />
      <rect x="21" y="23.5" width="6" height="8.5" rx="2" fill={SKIN} />
      {BACK[style]}
      <circle cx="24" cy="17" r="9" fill={SKIN} {...S} />
      <Face />
      {FRONT[style]}
    </svg>
  );
}
