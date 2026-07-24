# On Your Mark Transportation — Project Dashboard

A shared checklist and timeline dashboard for the OYMT and 100 Cups project list.
Everyone on the team sees the same progress: when one person checks a box, it shows
up for everyone within a few seconds.

## What's inside

- `public/index.html` — the dashboard (HTML, CSS, and JavaScript in one file)
- `server.js` — small Node/Express server + tiny API for shared state
- `package.json` — dependencies (Express, Postgres client)
- Three projects tracked: OYMT Geo-Fence (South Bend), Southern Express (NC),
  American Stage Tours (N. California)
- A timeline, per-project progress bars, and "who did what" name tags

## How the sharing works

- Checkbox state is saved on the server in a **Postgres database**, not in the browser.
- The page refreshes state every 5 seconds, so the team stays in sync.
- Each person types their name once (top of the page); their name shows next to
  boxes they check.

## Deploy to Railway — step by step

You'll need a Railway account (railway.app). These steps use the GitHub repo so
every future change deploys automatically.

### 1. Create the project from this repo

1. In Railway, click **New Project**.
   - **What you'll see:** a menu of options.
2. Choose **Deploy from GitHub repo** and pick this repository.
3. Railway reads `package.json`, installs dependencies, and runs `npm start` on its own.

### 2. Add the shared database

1. In your project, click **New** then **Database** then **Add PostgreSQL**.
   - **What you'll see:** a Postgres box appear next to your app.
2. Click your **app** service, go to the **Variables** tab.
3. Add a variable named `DATABASE_URL` and set its value by referencing the Postgres
   service (Railway lets you pick `${{Postgres.DATABASE_URL}}` from a dropdown).
   - **What you'll see:** the value fills in with a reference to the database.
4. The app creates the table it needs automatically on first start.

### 3. Get your live link

1. Click your app service, go to **Settings** then **Networking**.
2. Click **Generate Domain**.
   - **What you'll see:** a public link like `oymt-dashboard.up.railway.app`.
3. Open it. That's the dashboard the whole team uses.

### 4. (Recommended) Lock it with a password

Client project info should not be open to the public. To require a shared password:

1. In the app's **Variables** tab, add `APP_PASSWORD` and set it to a password of
   your choice.
2. Redeploy (Railway usually does this automatically when a variable changes).
3. Now anyone opening the link gets a login box. Any username works; the password
   is the one you set. Share it with the team only.

## Run it locally (optional)

```bash
npm install
npm start          # runs on http://localhost:3000
```

Without a `DATABASE_URL` it uses in-memory storage (fine for testing; resets when
you stop it). Copy `.env.example` to `.env` to set variables locally.

## Editing tasks later

Open `public/index.html` and find the `const DATA = [ ... ]` block near the bottom.
Each task is one line. Add, remove, or reword tasks there. Keep each task's `id`
unique and stable so saved progress stays matched to the right item.
