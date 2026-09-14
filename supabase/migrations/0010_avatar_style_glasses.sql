-- Swap the "scarf" character for "glasses": as a wrapped-ring silhouette it
-- kept reading as a magnifying glass, not a scarf. No production profile has
-- picked it yet (the feature hasn't shipped), so this is a plain rename.

alter table public.profiles
  drop constraint if exists avatar_style_check;

alter table public.profiles
  add constraint avatar_style_check check (
    avatar_style in (
      'initials', 'classic', 'cropped', 'curly', 'bun',
      'waves', 'beanie', 'beret', 'glasses'
    )
  );
