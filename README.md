# On Your Mark Transportation — Project Dashboard

A simple, self-contained checklist and timeline dashboard for the OYMT and 100 Cups
project list. One file, no build step, no server. Checkboxes save automatically in
the browser.

## What's inside

- `index.html` — the entire dashboard (HTML, CSS, and JavaScript in one file)
- `netlify.toml` — Netlify publish settings
- Three projects tracked: OYMT Geo-Fence (South Bend), Southern Express (NC),
  American Stage Tours (N. California)
- A timeline section and per-project progress bars

## How progress saving works

Checkmarks are stored in your browser using localStorage. That means:

- Progress is saved automatically as you click.
- It is private to the device and browser you're using.
- It does **not** sync between people or between phone and laptop.

If you need shared, multi-person tracking later, that's a bigger change (a small
backend or a database). This version is intentionally the "basic" one you asked for.

## Deploy to Netlify — two ways

### Option A: Drag and drop (fastest)

1. Go to **app.netlify.com** and log in.
2. Click **Add new site** then **Deploy manually**.
   - **What you'll see:** a big box that says "Drag and drop your site output folder here."
3. Drag this whole project folder into that box.
4. Wait a few seconds. Netlify gives you a live link like `random-name.netlify.app`.
5. (Optional) Rename it under **Site configuration → Change site name**.

### Option B: Connect this GitHub repo (auto-deploys on every change)

1. In Netlify, click **Add new site** then **Import an existing project**.
2. Choose **GitHub** and pick this repository.
3. Leave the build command blank and set **Publish directory** to `.` (a single dot).
   - Netlify will read `netlify.toml` and fill these in for you.
4. Click **Deploy**. Every future push updates the live site automatically.

## Editing tasks later

Open `index.html` and find the `const DATA = [ ... ]` block near the bottom. Each task
is one line. Add, remove, or reword tasks there. Keep each task's `id` unique so saved
progress stays matched to the right item.
