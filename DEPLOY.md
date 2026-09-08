# Deploying Stub

Stub is a static Vite build that talks to Supabase and TMDB from the browser,
so any static host works. These notes use Vercel.

## Vercel (Git integration)

1. https://vercel.com → sign in with GitHub.
2. **Add New… → Project** → import `tamkin-anwar/stub`.
3. Vercel detects Vite. Leave the build command (`npm run build`) and output
   directory (`dist`) as detected.
4. Add three **Environment Variables** (same names as `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TMDB_ACCESS_TOKEN`
5. **Deploy.** Every push to `main` redeploys automatically.

`vercel.json` rewrites all paths to `index.html` so client-side routes like
`/app/library` load on refresh instead of 404ing.

## After the first deploy

- Point the GitHub About link at it:
  ```bash
  gh repo edit tamkin-anwar/stub --homepage https://YOUR-DEPLOY-URL
  ```
- Supabase → **Authentication → URL Configuration**: set **Site URL** to the
  deploy URL. Not required while email confirmation is off and there is no
  OAuth, but it is needed the moment you add password reset or a provider.

## CLI alternative

```bash
npm i -g vercel
vercel login
vercel link
vercel env add VITE_SUPABASE_URL production      # repeat for the other two
vercel --prod
```
