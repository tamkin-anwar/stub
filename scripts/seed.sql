-- Seeded from the Tamkin & Ridu Film Archive for @tamkinanwar
-- 62 titles. Apply: npx supabase db query --linked -f scripts/seed.sql
begin;
-- The Intern (2015) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (257211, 'movie', 'The Intern', 2015, '70-year-old widower Ben Whittaker has discovered that retirement isn''t all it''s cracked up to be. Seizing an opportunity to get back in the game, he becomes a senior intern at an online fashion site, founded and run by Jules Ostin.', '/u7o3TwUgukRzTIyPwdMVdqmMRMD.jpg', '/i8Q2Ei2dPliMLgPWYhRTxIDzh7r.jpg', 121, array['Comedy']::text[], 7.2, 'tt2361509', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Devil Wears Prada (2006) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (350, 'movie', 'The Devil Wears Prada', 2006, 'A young woman from the Midwest gets more than she bargained for when she moves to New York to become a writer and ends up as the assistant to the tyrannical, larger-than-life editor-in-chief of a major fashion magazine.', '/8912AsVuS7Sj915apArUFbv6F9L.jpg', '/gkh6Nt8DtY1XT4gQsyFq9XAVJlJ.jpg', 109, array['Drama','Comedy']::text[], 7.4, 'tt0458352', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Project Hail Mary (2026) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (687163, 'movie', 'Project Hail Mary', 2026, 'Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is or how he got there. As his memory returns, he begins to uncover his mission: solve the riddle of the mysterious substance causing the sun to die out. He must call on his scientific knowledge and unorthodox ideas to save everything on Earth from extinction.', '/yihdXomYb5kTeSivtFndMy5iDmf.jpg', '/8Tfys3mDZVp4tNoH2ktm06a0Tau.jpg', 157, array['Science Fiction','Adventure']::text[], 8.6, 'tt12042730', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Love & Other Drugs (2010) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (43347, 'movie', 'Love & Other Drugs', 2010, 'Maggie is an alluring free spirit who won''t let anyone – or anything – tie her down. But she meets her match in Jamie, whose relentless and nearly infallible charm serves him well with the ladies and the cutthroat world of pharmaceutical sales. Maggie and Jamie''s evolving relationship takes them both by surprise, as they find themselves under the influence of the ultimate drug: love.', '/wZLM2uKJRYNchLmiCIjosX0rXy8.jpg', '/fGBJEfGjHmhg7nLAT0Jkcv9qV5e.jpg', 112, array['Drama','Comedy','Romance']::text[], 7, 'tt0758752', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Hating Game (2021) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (603661, 'movie', 'The Hating Game', 2021, 'Resolving to achieve professional success without compromising her ethics, Lucy embarks on a ruthless game of one-upmanship against cold and efficient nemesis Joshua, a rivalry that is complicated by her growing attraction to him.', '/prbZxJxGcy07y60eq8lCGMciTYz.jpg', '/lghWedsBBl3lPlIs4EpZpP64mUT.jpg', 102, array['Drama','Comedy','Romance']::text[], 7.3, 'tt8718158', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Mr. & Mrs. Smith (2005) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (787, 'movie', 'Mr. & Mrs. Smith', 2005, 'A husband and wife struggle to keep their marriage alive until they realize they are both secretly working as assassins. Now, their respective assignments require them to kill each other.', '/kjD700RtyhveN3ZbOnSvUSne0Qj.jpg', '/tgDSUwWMgypgmcBhRs9u30RLPNC.jpg', 120, array['Action','Comedy','Drama','Thriller']::text[], 6.7, 'tt0356910', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Fair Play (2023) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (910571, 'movie', 'Fair Play', 2023, 'An unexpected promotion at a cutthroat hedge fund pushes a young couple''s relationship to the brink, threatening to unravel not only their recent engagement but their lives.', '/btExhxzdUZoQagLaYyXgT4KgT2e.jpg', '/50Wq7fY21obXVRICuljdlSigWvH.jpg', 113, array['Drama','Thriller','Romance']::text[], 6.4, 'tt16304446', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Pride & Prejudice (2005) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (4348, 'movie', 'Pride & Prejudice', 2005, 'A story of love and life among the landed English gentry during the Georgian era. Mr. Bennet is a gentleman living in Hertfordshire with his overbearing wife and five daughters, but if he dies their house will be inherited by a distant cousin whom they have never met, so the family''s future happiness and security is dependent on the daughters making good marriages.', '/o8UhmEbWPHmTUxP0lMuCoqNkbB3.jpg', '/1Onam6oWyFAUCcoxtdWkACtEiNr.jpg', 128, array['Drama','Romance']::text[], 8.1, 'tt0414387', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Knives Out (2019) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (546554, 'movie', 'Knives Out', 2019, 'When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive and debonair Detective Benoit Blanc is mysteriously enlisted to investigate. From Harlan''s dysfunctional family to his devoted staff, Blanc sifts through a web of red herrings and self-serving lies to uncover the truth behind Harlan''s untimely death.', '/pThyQovXQrw2m0s9x82twj48Jq4.jpg', '/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg', 131, array['Comedy','Crime','Mystery']::text[], 7.8, 'tt8946378', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Glass Onion: A Knives Out Mystery (2022) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (661374, 'movie', 'Glass Onion: A Knives Out Mystery', 2022, 'World-famous detective Benoit Blanc heads to Greece to peel back the layers of a mystery surrounding a tech billionaire and his eclectic crew of friends.', '/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg', '/y3uOfZAYwLkbvhunswBCskNMrfI.jpg', 140, array['Comedy','Crime','Mystery']::text[], 7, 'tt11564570', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Wake Up Dead Man: A Knives Out Mystery (2025) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (812583, 'movie', 'Wake Up Dead Man: A Knives Out Mystery', 2025, 'When young priest Jud Duplenticy is sent to assist charismatic firebrand Monsignor Jefferson Wicks, it’s clear that all is not well in the pews. After a sudden and seemingly impossible murder rocks the town, the lack of an obvious suspect prompts local police chief Geraldine Scott to join forces with renowned detective Benoit Blanc to unravel a mystery that defies all logic.', '/iV9LM8aUb83BjCCx2RUnKE5sSQg.jpg', '/fiRDzpcJe7qz3yIR43hdXIE3NHv.jpg', 145, array['Thriller','Mystery','Comedy']::text[], 7.2, 'tt14364480', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Always Be My Maybe (2019) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (513576, 'movie', 'Always Be My Maybe', 2019, 'Reunited after 15 years, famous chef Sasha and hometown musician Marcus feel the old sparks of attraction, but struggle to adapt to each other''s worlds.', '/3BO6pPa7qDcpPYct061Luh9fvst.jpg', '/aC5LAGfHzVH8f7tkCwkxzXsqAZz.jpg', 102, array['Romance','Comedy']::text[], 6.6, 'tt7374948', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Adam Project (2022) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (696806, 'movie', 'The Adam Project', 2022, 'After accidentally crash-landing in 2022, time-traveling fighter pilot Adam Reed teams up with his 12-year-old self on a mission to save the future.', '/wFjboE0aFZNbVOF05fzrka9Fqyx.jpg', '/ewUqXnwiRLhgmGhuksOdLgh49Ch.jpg', 106, array['Adventure','Science Fiction','Comedy']::text[], 7, 'tt2463208', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Friends with Benefits (2011) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (50544, 'movie', 'Friends with Benefits', 2011, 'Dylan is done with relationships. Jamie decides to stop buying into the Hollywood clichés of true love. When the two become friends they decide to try something new and take advantage of their mutual attraction - but without any emotional attachment.', '/nKhhDFCdzxeJ3GUunQ570LDpUkz.jpg', '/n19KqpP6iBwTQzE2DORnktbSdwa.jpg', 109, array['Romance','Comedy']::text[], 6.6, 'tt1632708', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Your Name. (2016) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (372058, 'movie', 'Your Name.', 2016, 'High schoolers Mitsuha and Taki are complete strangers living separate lives. But one night, they suddenly switch places. Mitsuha wakes up in Taki’s body, and he in hers. This bizarre occurrence continues to happen randomly, and the two must adjust their lives around each other.', '/vfJFJPepRKapMd5G2ro7klIRysq.jpg', '/mMtUybQ6hL24FXo0F3Z4j2KG7kZ.jpg', 106, array['Animation','Romance','Drama']::text[], 8.5, 'tt5311514', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Lucy (2014) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (240832, 'movie', 'Lucy', 2014, 'A woman, accidentally caught in a dark deal, turns the tables on her captors and transforms into a merciless warrior evolved beyond human logic.', '/kRbpUTRNm6QbLQFPFWUcNC4czEm.jpg', '/1hzH1Wu2xhXBNOWzw3RMwNTJX5q.jpg', 89, array['Action','Science Fiction']::text[], 6.5, 'tt2872732', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Carry-On (2024) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (1005331, 'movie', 'Carry-On', 2024, 'An airport security officer races to outsmart a mysterious traveler forcing him to let a dangerous item slip onto a Christmas Eve flight.', '/sjMN7DRi4sGiledsmllEw5HJjPy.jpg', '/rhc8Mtuo3Kh8CndnlmTNMF8o9pU.jpg', 120, array['Thriller','Action']::text[], 6.9, 'tt21382296', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Wayward (2025) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (255859, 'tv', 'Wayward', 2025, 'A small-town cop suspects that the local school for troubled teens — and its dangerously charismatic founder — may not be all it seems.', '/t6bk8g9DsITWZXwnw9jrA9RDdCB.jpg', '/znwchNfU5Vr2RNbxnI2iVIxVeMD.jpg', 44, array['Drama','Mystery']::text[], 6.1, 'tt27427326', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Night Agent (2023) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (129552, 'tv', 'The Night Agent', 2023, 'Brought together by a midnight phone call, an FBI agent and a cybersecurity expert must unravel an ever-growing web of political conspiracies.', '/4c5yUNcaff4W4aPrkXE6zr7papX.jpg', '/gklrevVndG98GHGDwfm8y8kxESo.jpg', null, array['Action & Adventure','Drama','Mystery']::text[], 7.7, 'tt13918776', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Beast in Me (2025) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (250504, 'tv', 'The Beast in Me', 2025, 'A famous author is pulled into a twisted mind game with her rich, powerful new neighbor — who might be a murderer.', '/jxf7JCfIMvGONWTNUIJ068sFixK.jpg', '/ylW0m5UztyyL4YFu8EC6usUHLF.jpg', null, array['Drama','Mystery']::text[], 7.1, 'tt31974367', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Fool Me Once (2024) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (220801, 'tv', 'Fool Me Once', 2024, 'When ex-soldier Maya sees her murdered husband on a secret nanny cam, she uncovers a deadly conspiracy that stretches deep into the past.', '/Ertv4WLEyHgi8zN4ldOKgPcGAZ.jpg', '/v9OgLxYCq5newNdtF8dQAFENs4l.jpg', null, array['Drama','Crime','Mystery']::text[], 7.2, 'tt5611024', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Run Away (2026) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (244244, 'tv', 'Run Away', 2026, 'A desperate father searching for his runaway daughter gets caught up in a murder case — and stumbles upon secrets which could destroy his family for good.', '/frKxKytEHIA2vXg4RAz14Sc0UmS.jpg', '/1jBYTcOuiPNJsTcfYk66bbVLSBz.jpg', null, array['Drama','Mystery']::text[], 6.6, 'tt9169516', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Hostage (2025) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (248937, 'tv', 'Hostage', 2025, 'When the British prime minister''s husband is kidnapped and the French president starts receiving threats, both leaders must face an impossible choice.', '/ghcxxmSLByYyFLAL8TNWmAel1Ym.jpg', '/mPsf0GVm115YOrNn0EyLnqPRpcv.jpg', null, array['Drama','War & Politics']::text[], 6.8, 'tt31407004', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- HIS & HERS (2026) [watched]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (259731, 'tv', 'HIS & HERS', 2026, 'Two estranged spouses — one a detective, the other a news reporter — vie to solve a murder in which each believes the other is a prime suspect.', '/cDSXLVQLkCSBIpBx3UW04TsfZ5c.jpg', '/n4hJLZmBG8kZccNn7bNgBDsVQ6a.jpg', null, array['Drama','Crime','Mystery']::text[], 7.3, 'tt33035373', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watched', (select id from public.profiles where username = 'tamkinanwar'), '',
       current_date
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Four Seasons (2025) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (243316, 'tv', 'The Four Seasons', 2025, 'The decades-long friendship between three married couples is tested when one divorces, complicating their tradition of quarterly weekend getaways.', '/w09XeYl096pwES8riRMZwEA9rnh.jpg', '/xJATsbyFLf4LMtJBOco08RNxqPE.jpg', null, array['Comedy']::text[], 6.9, 'tt30826447', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Weathering with You (2019) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (568160, 'movie', 'Weathering with You', 2019, 'The summer of his high school freshman year, Hodaka runs away from his remote island home to Tokyo, and quickly finds himself pushed to his financial and personal limits. The weather is unusually gloomy and rainy every day, as if taking its cue from his life. After many days of solitude, he finally finds work as a freelance writer for a mysterious occult magazine. Then, one day, Hodaka meets Hina on a busy street corner. This bright and strong-willed girl possesses a strange and wonderful ability: the power to stop the rain and clear the sky.', '/qgrk7r1fV4IjuoeiGS5HOhXNdLJ.jpg', '/ize3ZieqSy0TCWljmVoEiy8fSFS.jpg', 112, array['Animation','Drama','Fantasy','Romance']::text[], 8, 'tt9426210', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Game of Thrones (2011) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (1399, 'tv', 'Game of Thrones', 2011, 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night''s Watch, is all that stands between the realms of men and icy horrors beyond.', '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', '/zZqpAXxVSBtxV9qPBcscfXBcL2w.jpg', null, array['Sci-Fi & Fantasy','Drama','Action & Adventure']::text[], 8.5, 'tt0944947', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), 'Rewatch.',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Blacklist (2013) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (46952, 'tv', 'The Blacklist', 2013, 'Raymond "Red" Reddington, one of the FBI''s most wanted fugitives, surrenders in person at FBI Headquarters in Washington, D.C. He claims that he and the FBI have the same interests: bringing down dangerous criminals and terrorists. In the last two decades, he''s made a list of criminals and terrorists that matter the most but the FBI cannot find because it does not know they exist. Reddington calls this "The Blacklist". Reddington will co-operate, but insists that he will speak only to Elizabeth Keen, a rookie FBI profiler.', '/4HTfd1PhgFUenJxVuBDNdLmdr0c.jpg', '/2eIlCirgcvEwmCSYh2wDfz5Sxvz.jpg', null, array['Drama','Crime','Mystery']::text[], 7.6, 'tt2741602', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- 1899 (2022) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (90669, 'tv', '1899', 2022, 'When mysterious events change the course of an immigrant ship headed for New York in 1899, a mind-bending riddle unfolds for its bewildered passengers.', '/gZleGu1MQVBArH2dlpZ9CGi0hhy.jpg', '/s1xnjbOIQtwGObPnydTebp74G2c.jpg', null, array['Mystery','Drama']::text[], 7.5, 'tt9319668', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Black Doves (2024) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (225385, 'tv', 'Black Doves', 2024, 'When a spy posing as a politician''s wife learns her lover has been murdered, an old assassin friend joins her on a quest for truth — and vengeance.', '/uoXtkm2P4HPPL8T3IBJ02G3hCC4.jpg', '/hP5pMJfxbY9p72LgEY6j9qGidtE.jpg', null, array['Action & Adventure','Mystery','Crime']::text[], 7.1, 'tt27995113', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Death Note (2006) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (13916, 'tv', 'Death Note', 2006, 'Light Yagami is an ace student with great prospects—and he’s bored out of his mind. But all that changes when he finds the Death Note, a notebook dropped by a rogue Shinigami death god. Any human whose name is written in the notebook dies, and Light has vowed to use the power of the Death Note to rid the world of evil. But will Light succeed in his noble goal, or will the Death Note turn him into the very thing he fights against?', '/tCZFfYTIwrR7n94J6G14Y4hAFU6.jpg', '/z8IPicmEKXUO4I2UDdMEqw7RqOE.jpg', 22, array['Animation','Mystery','Sci-Fi & Fantasy']::text[], 8.6, 'tt0877057', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Sirens (2025) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (246992, 'tv', 'Sirens', 2025, 'Worried about her sister''s too-close relationship with her billionaire boss, a scrappy everywoman seeks answers at a lavish seaside estate.', '/mezbwX9gFWTXl0XiicS5ZMcdXVx.jpg', '/nFOufr0IvCtMLyTleHOrtyj0htv.jpg', null, array['Drama','Comedy']::text[], 6.6, 'tt31429675', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- When Life Gives You Tangerines (2025) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (219246, 'tv', 'When Life Gives You Tangerines', 2025, 'In Jeju, a spirited girl and a steadfast boy''s island story blossoms into a lifelong tale of setbacks and triumphs — proving love endures across time.', '/Afrz3QAcQcsT6w4S5wrKUxmYPWM.jpg', '/a9qlroMOHewiDsUR93PYMVfpbF5.jpg', null, array['Drama']::text[], 8.8, 'tt26471411', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Black Mirror (2011) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (42009, 'tv', 'Black Mirror', 2011, 'Twisted tales run wild in this mind-bending anthology series that reveals humanity''s worst traits, greatest innovations and more.', '/seN6rRfN0I6n8iDXjlSMk1QjNcq.jpg', '/dg3OindVAGZBjlT3xYKqIAdukPL.jpg', null, array['Sci-Fi & Fantasy','Drama','Mystery']::text[], 8.3, 'tt2085059', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Dragon Ball (1986) [watching]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (12609, 'tv', 'Dragon Ball', 1986, 'Young Goku sets off on a quest with his teenage friend Bulma to find the seven Dragon Balls, which grant whoever possesses them a single wish.', '/onCLyCOgszTIyyVs2XKYSkKPOPG.jpg', '/30L49n4Dhn7dzuGG50GV3ybMhC3.jpg', 24, array['Animation','Action & Adventure','Sci-Fi & Fantasy']::text[], 8.3, 'tt0088509', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watching', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Crazy, Stupid, Love. (2011) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (50646, 'movie', 'Crazy, Stupid, Love.', 2011, 'Cal Weaver is living the American dream. He has a good job, a beautiful house, great children and a beautiful wife, named Emily. Cal''s seemingly perfect life unravels, however, when he learns that Emily has been unfaithful and wants a divorce. Over 40 and suddenly single, Cal is adrift in the fickle world of dating. Enter, Jacob Palmer, a self-styled player who takes Cal under his wing and teaches him how to be a hit with the ladies.', '/p4RafgAPk558muOjnBMHhMArjS2.jpg', '/vyrCniZsrXZAW08eECKIp1BMLPh.jpg', 118, array['Comedy','Drama','Romance']::text[], 7.3, 'tt1570728', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- American Psycho (2000) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (1359, 'movie', 'American Psycho', 2000, 'A wealthy New York investment banking executive hides his alternate psychopathic ego from his co-workers and friends as he escalates deeper into his illogical, gratuitous fantasies.', '/9uGHEgsiUXjCNq8wdq4r49YL8A1.jpg', '/5oaMV2q0qzxkIW2ukU3lldLu5q2.jpg', 102, array['Thriller','Drama','Crime']::text[], 7.4, 'tt0144084', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- 50/50 (2011) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (40807, 'movie', '50/50', 2011, 'Inspired by a true story, a comedy centered on a 27-year-old guy who learns of his cancer diagnosis and his subsequent struggle to beat the disease.', '/8f9tM9JVB4ETBhxlQcXIjLckArl.jpg', '/yq9g4RGM1mEMBoSL5HKVBy9MOPM.jpg', 100, array['Comedy','Drama']::text[], 7.2, 'tt1306980', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Perks of Being a Wallflower (2012) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (84892, 'movie', 'The Perks of Being a Wallflower', 2012, 'Pittsburgh, Pennsylvania, 1991. High school freshman Charlie is a wallflower, always watching life from the sidelines, until two senior students, Sam and her stepbrother Patrick, become his mentors, helping him discover the joys of friendship, music and love.', '/aKCvdFFF5n80P2VdS7d8YBwbCjh.jpg', '/aM6E4DBP6588q3tEr9hz41ls80q.jpg', 103, array['Drama']::text[], 7.8, 'tt1659337', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Holiday (2006) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (1581, 'movie', 'The Holiday', 2006, 'Two women, one American and one British, swap homes at Christmastime following bad breakups. Each woman finds romance with a local man but realizes that the imminent return home may end the relationship.', '/h1ITOpvJN3Tw4Sy60w2QTfYMvdd.jpg', '/9Ebn8atCcGk5OZrx4xmoTobAxoh.jpg', 136, array['Comedy','Romance']::text[], 7.1, 'tt0457939', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Revolutionary Road (2008) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (4148, 'movie', 'Revolutionary Road', 2008, 'A young couple living in a Connecticut suburb during the mid-1950s struggle to come to terms with their personal problems while trying to raise their two children. Based on a novel by Richard Yates.', '/cvkD3yiVXLg3as8EAG3LaTycONQ.jpg', '/ra9aXj8PpUbUHwwTRSl5zsL6WHM.jpg', 119, array['Drama','Romance']::text[], 7, 'tt0959337', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Think Like a Man (2012) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (67660, 'movie', 'Think Like a Man', 2012, 'The balance of power in four couples’ relationships is upset when the women start using the advice in Steve Harvey’s book, Act Like A Lady, Think Like A Man, to get more of what they want from their men. When the men realize that the women have gotten a hold of their relationship “playbook,” they decide that the best defense is a good offense and come up with a plan to use this information to their advantage.', '/kfIrKVPDzXJDBzPnFEuoatlaZPW.jpg', '/c8kjrMDDKrlpikQTgvNGLBZh5V8.jpg', 122, array['Comedy','Romance']::text[], 6.8, 'tt1621045', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Think Like a Man Too (2014) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (184098, 'movie', 'Think Like a Man Too', 2014, 'All the couples are back for a wedding in Las Vegas, but plans for a romantic weekend go awry when their various misadventures get them into some compromising situations that threaten to derail the big event.', '/yKI9Nof9MH3dNHM469hEfCjCbjJ.jpg', '/cMSfVBqshJTDfdwr00hxkpuwjRA.jpg', 105, array['Comedy','Romance']::text[], 6.4, 'tt2239832', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Fight Club (1999) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (550, 'movie', 'Fight Club', 1999, 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.', '/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg', '/c6OLXfKAk5BKeR6broC8pYiCquX.jpg', 139, array['Drama','Thriller']::text[], 8.4, 'tt0137523', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Pulp Fiction (1994) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (680, 'movie', 'Pulp Fiction', 1994, 'A burger-loving hit man, his philosophical partner, a drug-addled gangster''s moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.', '/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg', '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg', 154, array['Thriller','Crime','Comedy']::text[], 8.5, 'tt0110912', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Woman in the Window (2021) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (520663, 'movie', 'The Woman in the Window', 2021, 'An agoraphobic woman living alone in New York begins spying on her new neighbors only to witness a disturbing act of violence.', '/wcrjc1uwQaqoqtqi67Su4VCOYo0.jpg', '/gUttUEqsrvaMlK5oL5TSQ54iE96.jpg', 100, array['Crime','Mystery','Thriller']::text[], 6, 'tt6111574', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- How to Make a Killing (2026) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (467905, 'movie', 'How to Make a Killing', 2026, 'Disowned at birth by his obscenely wealthy family, blue-collar Becket Redfellow will stop at nothing to reclaim his inheritance, no matter how many relatives stand in his way.', '/kw7x5mSmHhoeeqwXLwXTBsofD1N.jpg', '/bkUa5ZDqjQPx6rkxs0hM87vaWVa.jpg', 105, array['Comedy','Thriller']::text[], 7, 'tt4357198', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Devil Wears Prada 2 (2026) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (1314481, 'movie', 'The Devil Wears Prada 2', 2026, 'Andy Sachs returns to Runway as Miranda Priestly navigates a new media landscape and Runway''s position within. The duo reconnect with former assistant Emily Charlton, now the head of a luxury brand that possesses funding which could ensure Runway''s survival.', '/xTI42pmsP5EDnvsNJPEDubwWBQO.jpg', '/Af907x5h9W1wVis8XrSd7ynTWuy.jpg', 119, array['Comedy','Drama']::text[], 7, 'tt33612209', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Drama (2026) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (1325734, 'movie', 'The Drama', 2026, 'A happily engaged couple is put to the test when an unexpected turn sends their wedding week off the rails.', '/rnIOUhzwJDfgQakx8EjoNyItKgs.jpg', '/1oKLEA9JOhvaBwLpqjROisvWMy7.jpg', 105, array['Romance','Comedy','Drama']::text[], 6.9, 'tt33071426', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Crown (2016) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (65494, 'tv', 'The Crown', 2016, 'The gripping, decades-spanning inside story of Her Majesty Queen Elizabeth II and the Prime Ministers who shaped Britain''s post-war destiny. 

The Crown tells the inside story of two of the most famous addresses in the world – Buckingham Palace and 10 Downing Street – and the intrigues, love lives and machinations behind the great events that shaped the second half of the 20th century. Two houses, two courts, one Crown.', '/1M876KPjulVwppEpldhdc8V4o68.jpg', '/8VXhcrl5z2I1zEU9X3pkkNrZlD.jpg', null, array['Drama']::text[], 8.2, 'tt4786824', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Agatha Christie's Seven Dials (2026) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (250505, 'tv', 'Agatha Christie''s Seven Dials', 2026, 'England, 1925. At a lavish country house party, a practical joke appears to have gone horribly, murderously wrong. It will be up to the unlikeliest of sleuths—the fizzingly inquisitive Lady Eileen ''Bundle'' Brent—to unravel a chilling plot that will change her life, cracking wide open the country house mystery.', '/3uRQi9HDEAGSadoKee1UHoFCaU9.jpg', '/eVEbRtSOrczWlYnVmwM195AnX86.jpg', null, array['Mystery','Crime','Drama']::text[], 6.3, 'tt31974288', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- The Umbrella Academy (2019) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (75006, 'tv', 'The Umbrella Academy', 2019, 'Reunited by their father''s death, estranged siblings with extraordinary powers uncover shocking family secrets — and a looming threat to humanity.', '/qhcwrnnCnN8NE1N6XXKHFmveJR9.jpg', '/gHJhN9AJV4PmJ7YpLFa9ldDWuG8.jpg', null, array['Action & Adventure','Sci-Fi & Fantasy','Drama']::text[], 8.5, 'tt1312171', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Behind Her Eyes (2021) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (97173, 'tv', 'Behind Her Eyes', 2021, 'A single mother enters a world of twisted mind games when she begins an affair with her psychiatrist boss while secretly befriending his mysterious wife.', '/sfd90NIf778KoBFmpdBTow4xTm7.jpg', '/w99Pk4pJSieveKIIc7KGXtsFT3U.jpg', 50, array['Mystery','Sci-Fi & Fantasy','Drama']::text[], 7.4, 'tt9698442', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Cyberpunk: Edgerunners (2022) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (105248, 'tv', 'Cyberpunk: Edgerunners', 2022, 'In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw — an edgerunner.', '/lqcDVZ8pyk08AVftMBildDR3QUK.jpg', '/3UbHGmu9vIMSC5uNfnGt7DjetqT.jpg', null, array['Animation','Action & Adventure','Sci-Fi & Fantasy','Crime']::text[], 8.5, 'tt12590266', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Stranger Things (2016) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (66732, 'tv', 'Stranger Things', 2016, 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.', '/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg', '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', null, array['Action & Adventure','Mystery','Sci-Fi & Fantasy']::text[], 8.6, 'tt4574334', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Squid Game (2021) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (93405, 'tv', 'Squid Game', 2021, 'Hundreds of cash-strapped players accept a strange invitation to compete in children''s games. Inside, a tempting prize awaits — with deadly high stakes.', '/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg', '/2meX1nMdScFOoV4370rqHWKmXhY.jpg', null, array['Action & Adventure','Mystery','Drama']::text[], 7.9, 'tt10919420', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Suits (2011) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (37680, 'tv', 'Suits', 2011, 'While running from a drug deal gone bad, Mike Ross, a brilliant young college-dropout, slips into a job interview with one of New York City''s best legal closers, Harvey Specter. Tired of cookie-cutter law school grads, Harvey takes a gamble by hiring Mike on the spot after he recognizes his raw talent and photographic memory.', '/vQiryp6LioFxQThywxbC6TuoDjy.jpg', '/or0E36KfzJYZwqXeiCfm1JgepKF.jpg', 42, array['Drama']::text[], 8.2, 'tt1632701', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- House (2004) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (1408, 'tv', 'House', 2004, 'Dr. Gregory House, a drug-addicted, unconventional, misanthropic medical genius, leads a team of diagnosticians at the fictional Princeton–Plainsboro Teaching Hospital in New Jersey.', '/3Cz7ySOQJmqiuTdrc6CY0r65yDI.jpg', '/r0Q6eeN9L1ORL9QsV0Sg8ZV3vnv.jpg', 44, array['Drama']::text[], 8.6, 'tt0412142', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- House of the Dragon (2022) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (94997, 'tv', 'House of the Dragon', 2022, 'The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights. In the case of the Targaryens, their slow fall begins when King Viserys breaks with a century of tradition by naming his daughter Rhaenyra heir to the Iron Throne. But when Viserys later fathers a son, the court is shocked when Rhaenyra retains her status as his heir, and seeds of division sow friction across the realm.', '/7V0Ebks0GgpKvQ7QbLAIdX5dos4.jpg', '/577eXC8wFQT0eUrJcgznSiFPRmk.jpg', null, array['Sci-Fi & Fantasy','Drama','Action & Adventure']::text[], 8.4, 'tt11198330', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Manifest (2018) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (79696, 'tv', 'Manifest', 2018, 'After landing from a turbulent but routine flight, the crew and passengers of Montego Air Flight 828 discover five years have passed in what seemed like a few hours. As their new realities become clear, a deeper mystery unfolds and some of the returned passengers soon realize they may be meant for something greater than they ever thought possible.', '/eTemCphrglLKrXOsNRhYezHA7H9.jpg', '/iZu83GB1IM7VXL2X90m7iLHYUHU.jpg', 42, array['Sci-Fi & Fantasy','Mystery','Drama']::text[], 7.6, 'tt8421350', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Clickbait (2021) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (129495, 'tv', 'Clickbait', 2021, 'When family man Nick Brewer is abducted in a crime with a sinister online twist, those closest to him race to uncover who is behind it and why.', '/q42t4S113jebD1khigJt8z3m1mD.jpg', '/2CIpC7glUacb1urK8Rdr6O2rZnc.jpg', null, array['Drama','Mystery','Crime']::text[], 7.1, 'tt10888878', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;

-- Outlander (2014) [watchlist]
with t as (
  insert into public.titles
    (tmdb_id, media_type, name, year, overview, poster_path, backdrop_path, runtime, genres, tmdb_rating, imdb_id, updated_at)
  values
    (56570, 'tv', 'Outlander', 2014, 'The story of Claire Randall, a married combat nurse from 1945 who is mysteriously swept back in time to 1743, where she is immediately thrown into an unknown world where her life is threatened. When she is forced to marry Jamie, a chivalrous and romantic young Scottish warrior, a passionate affair is ignited that tears Claire''s heart between two vastly different men in two irreconcilable lives.', '/oftZNfyTVNU7IfOqoGLoT8MGvNs.jpg', '/nf3Vlxm3C9U1aKUUQHmKFZmxPSc.jpg', null, array['Drama','Sci-Fi & Fantasy']::text[], 8.2, 'tt3006802', now())
  on conflict (tmdb_id, media_type) do update set
    name = excluded.name, year = excluded.year, overview = excluded.overview,
    poster_path = excluded.poster_path, backdrop_path = excluded.backdrop_path,
    runtime = excluded.runtime, genres = excluded.genres,
    tmdb_rating = excluded.tmdb_rating, imdb_id = excluded.imdb_id, updated_at = now()
  returning id
)
insert into public.list_entries (owner_type, owner_id, title_id, status, added_by, note, watched_on)
select 'user', (select id from public.profiles where username = 'tamkinanwar'), t.id, 'watchlist', (select id from public.profiles where username = 'tamkinanwar'), '',
       null
from t
on conflict (owner_type, owner_id, title_id) do nothing;
commit;
