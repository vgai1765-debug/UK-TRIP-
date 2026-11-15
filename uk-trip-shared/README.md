# Great British Summer 2027 – shared trip planner (Netlify)

Installable web app (PWA) with shared storage. Every traveller's phone keeps a local copy (works offline)
and syncs through one Netlify Function + Netlify Blobs. Changes from other phones appear within a few seconds.

## Folder layout
    public/                 the app (index.html, sw.js, manifest, icons)
    netlify/functions/      state.mjs  – the shared-storage API at /api/state
    netlify.toml            tells Netlify where things are
    package.json            installs @netlify/blobs

## Deploy (Git method – recommended, because the function needs `npm install`)
1. Create a GitHub repository and upload ALL of these files and folders (keep the folder structure).
2. On netlify.com: **Add new project → Import an existing project → GitHub** → choose the repo → Deploy.
   (Build settings are read from netlify.toml; leave build command empty.)
3. **Project configuration → Environment variables → Add variable**
   - Key: `TRIP_CODE`  Value: a secret code only your group knows (e.g. 12+ characters)
4. **Deploys → Trigger deploy → Deploy project without cache** so the variable takes effect.
5. Open your Netlify address in Safari, enter the trip code when asked, then **Share → Add to Home Screen**.
6. Give the address and trip code to the other five travellers (use a private chat).

(CLI alternative: `npm i -g netlify-cli`, `npm install`, `netlify deploy --prod`.)

## How syncing works
- Each phone saves locally first, then pushes changes; it checks for others' changes every ~4 seconds while the app is open.
- If you are offline, changes are kept and sent when you are back online.
- Per item, the most recent edit wins. Deleted items are remembered so they do not come back.
- The header shows status: 🟢 shared · 🔄 syncing · ⚪ offline · 🔒 enter code · 🟠 problem · 💾 local only (no server found).

## Limits / notes
- Near-real-time via polling, not instant push (Netlify Functions cannot hold live connections).
- Phones' clocks decide "most recent", so keep automatic date & time on.
- If two people save the same instant, one save can occasionally be overwritten; just re-enter it.
- Roles (Admin/Member) are labels only. Anyone with the address and trip code can edit everything.
- Do not type passport numbers or card numbers into the app. Data is stored in Netlify Blobs under your account.
- Updating: replace files in the repo; Netlify redeploys. To force phones to refresh, change `gbs27-v2` in public/sw.js.
- Free Netlify plan limits apply; a six-person trip planner should be well within them.
