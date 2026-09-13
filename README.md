# Brand Visual Workflow

Classroom demo: turn a **Brand Core** into a consistent **Brand Visual Rules** system in 4 guided steps —
`Visual Brief → 3 Visual Directions → Logo + Visual DNA → Visual Rules`.

> AI = explore · Human = decide · AI = execute · Human = approve

## Stack

- Vite + React (JS) + Zustand — single-page app, no backend.
- **Text**: Aliyun ModelStudio (Qwen3.7-flash) via OpenAI-compatible `/chat/completions`.
- **Image**: Volcengine Ark (`doubao-seedream-4-5-251128`) via OpenAI-compatible `/images/generations`.
- Transport **Mode A**: the Vite dev server proxies `/v1` (text) and `/ark` (image) and injects the API keys from
  `.env.local` — **keys never reach the browser or the bundle**.

## Deploy to Vercel (public classroom site — keys never exposed)

The app ships a **serverless same-origin proxy** (`api/proxy.mjs` + `vercel.json`):
browsers call `/v1` and `/ark` on your Vercel domain; the function injects the API keys
from **Vercel project environment variables** and forwards to Aliyun / Ark. Keys are never
in the client bundle.

1. Push the repo (`.env*` and keys are git-ignored).
2. Import on Vercel (or `npm i -g vercel && vercel`), framework **Other / Vite**, it should auto-detect; `vercel.json` sets build & output.
3. Set project environment variables:
   - `DASHSCOPE_API_KEY` — Aliyun Model Studio
   - `ARK_IMAGE_API_KEY` — Volcengine Ark
   - optional `DEMO_ACCESS_TOKEN` + build env `VITE_ACCESS_TOKEN` (same value) — shared-token gate so random visitors can't burn your quota
4. Redeploy. Every team opens the URL, uses your keys server-side, no setup.

> Why teams won't see each other's data: the site has **no server-side state** and stores everything in
> each browser's `localStorage` (per-device). Separate computers = fully isolated. The only shared resources
> are the two API accounts (rate-limited) and, if you see teams sharing one browser, local project data —
> use `New` or Import/Export JSON to separate projects.
> If any team needs its own brand results, Export JSON on that machine and Import on another.

### Setup (local dev)

```bash
# 1. install deps
npm install

# 2. configure keys (create this file if missing — it is git-ignored)
#    copy from .env.example
#    .env.local
DASHSCOPE_API_KEY=sk-...                                  # Aliyun Model Studio
ARK_IMAGE_API_KEY=...                                     # Volcengine Ark

# 3. run
npm run dev        # → http://localhost:5173  (proxy mode, keys stay server-side)

# build (for static hosting you must switch to Mode B in ⚙ Connections and enter keys)
npm run build && npm run preview
```

> ⚠️ Never put real keys into `.env.example` or commit any `.env.local`. The page UI shows the same warning.

## Using the demo (10–15 min)

1. `Load sample` → fills `Haven` Brand Core — or **`Import file`**: drop a brand strategy (`.docx`, `.pptx`, `.txt`, `.md`, `.csv`, `.html`, `.json`) and the AI auto-fills the 9 Brand Core fields. (PDF: convert to Word/text first.)
2. Step 01 — generate the **Visual Brief**, edit it, Approve.
3. Step 02 — **3 Visual Directions**, each with a live hero image (one at a time). Ask the audience to vote. Approve one.
4. Step 03 — **3 Logo concepts** (rendered) + **8-dimension Visual DNA**. Choose a logo.
5. Step 04 — compile **Brand Visual Rules** (10 sections + AI Prompt Recipe + reusable instruction block).
6. **Export HTML / Markdown / JSON.**

## Known constraints (verified 2026-09-05)

- `qwen3.7-flash` is a reasoning model → the app sets `response_format: json_object` and a generous `max_tokens`.
- Ark images require **size ≥ 3,686,400 px** (minimum square `1920x1920`). `size` defaults accordingly.
- Ark returns **TOS signed URLs valid ~24h**. Images display fine during a session; exported HTML embeds them as
  data URIs so the guide survives; exported Markdown keeps the (temporary) URLs.
- Aliyun Model Studio (this deployment) blocks browser CORS → dev uses the local proxy (Mode A). `vite preview`
  reuses the proxy so local hosting works too.

## Connections panel

Open ⚙ Connections:
- Edit model names / base URLs.
- `Test text connection` → one tiny chat request. `Test image connection` → verifies auth+routing by hitting the
  known size-floor error (does not spend a generation).
- **Mode B** (checkbox) switches to direct browser calls with keys typed into the panel (stored in localStorage).
  Only for providers that allow CORS and local-only use.

## Files

```
src/
  app/          App + stepper config
  components/   Stepper, cards, config modal, ui primitives
  steps/        Step1..Step4
  prompts/      4 prompt builders + image prompt recipes
  services/     llm.js · image.js · sample.js
  store/        projectStore.js (Zustand + localStorage)
  export/       exportHTML · exportMarkdown · download
```