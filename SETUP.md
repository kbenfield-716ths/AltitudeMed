# Case Engine Setup Guide

Three steps: get an API key, deploy the proxy to Vercel, update one line in the HTML.

---

## Step 1 — Get an Anthropic API Key

1. Go to https://console.anthropic.com
2. Create an account (or sign in)
3. Navigate to **API Keys** → **Create Key**
4. Copy the key — you'll only see it once

The case engine uses `claude-haiku-4-5-20251001` by default, which is fast and inexpensive
(roughly $0.001–0.003 per full case conversation at typical usage).

---

## Step 2 — Deploy the Proxy to Vercel

The proxy function keeps your API key secure on the server — it is never sent to the browser.

### 2a — Create a Vercel account

Sign up free at https://vercel.com (GitHub login works).

### 2b — Push this folder to GitHub

Your project folder needs to be a GitHub repo. If it isn't already:

```bash
cd /path/to/AltitudePhysStudents
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2c — Import the repo in Vercel

1. In Vercel dashboard → **Add New Project** → **Import Git Repository**
2. Select your repo
3. Leave all build settings at defaults — Vercel auto-detects the `api/` directory
4. Click **Deploy**

Vercel will give you a URL like `https://your-project-name.vercel.app`.

### 2d — Add the API key as an environment variable

In your Vercel project:
1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from Step 1
   - **Environment:** Production (and Preview if you want)
3. Click **Save**
4. Go to **Deployments** → click the three dots on your latest deployment → **Redeploy**
   (environment variables only take effect after a redeploy)

---

## Step 3 — Update case-engine.html

Open `case-engine.html` and find this line near the top of the `<script>` block:

```js
const PROXY_URL = 'https://YOUR_PROJECT.vercel.app/api/chat';
```

Replace `YOUR_PROJECT` with your actual Vercel project name, e.g.:

```js
const PROXY_URL = 'https://altitude-case-engine.vercel.app/api/chat';
```

Save the file, push to GitHub, and Vercel will redeploy automatically.

---

## Step 4 — Link from altitudephys.html (optional)

Add a link to the case engine from the existing module's navigation. In `altitudephys.html`,
find the "Self-Assessment" nav item and add a sibling link:

```html
<a href="case-engine.html" class="left-nav-item" ...>
  🩺 Case Engine
</a>
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Config notice" banner in the UI | PROXY_URL still contains `YOUR_PROJECT` |
| HTTP 401 from the proxy | API key not set or misspelled in Vercel env vars; redeploy after saving |
| HTTP 500 from the proxy | Check Vercel function logs: Dashboard → your project → Functions tab |
| CORS error in browser console | In `api/chat.js`, change `'*'` to `'https://kbenfield-716ths.github.io'` for stricter security |
| Cases don't load after page refresh | Expected — conversation state is in-memory only; refresh starts fresh |

---

## Changing the AI Model

In `api/chat.js`, find:

```js
model: 'claude-haiku-4-5-20251001',
```

Upgrade to `claude-sonnet-4-6` for stronger clinical reasoning and more nuanced
Socratic guidance (higher cost per conversation). Haiku is recommended for everyday
student use; Sonnet is worth it for demonstrations or high-stakes cases.

---

## Adding New Cases

Each case is a plain JavaScript object in the `CASES` array in `case-engine.html`. Copy
any existing case object and update:

- `id` — unique string, no spaces
- `title` — displayed in the sidebar
- `topic` — `'AMS'`, `'HACE'`, `'HAPE'`, or `'Pharm'`
- `difficulty` — `'Beginner'`, `'Intermediate'`, or `'Advanced'`
- `location` — altitude + place name
- `system` — the full system prompt describing the case and interaction rules

The system prompt format used in all existing cases is the recommended pattern:
include a `CASE DETAILS` block, an `INTERACTION RULES` block, and the stage-tag
instruction at the end.
