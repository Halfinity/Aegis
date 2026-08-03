# Detection Rule Forge

Describe a detection in plain English — get production-ready detection logic in nine languages: **Sigma, KQL (Microsoft Sentinel), SPL (Splunk), YARA-L 2.0 (Google SecOps), XQL (Cortex XDR), EQL (Elastic), Elasticsearch DSL, SQL, and Python.**

```
"SSH from External IP Address" → Sigma + KQL + SPL + YARA-L + XQL + EQL + Elasticsearch DSL + SQL + Python
```

## Architecture

GitHub Pages only serves static files, so this project splits into two pieces:

| Piece | What it is | Where it runs |
|---|---|---|
| `frontend/` | React + Vite + Tailwind single-page app | Static hosting (GitHub Pages) |
| `worker/` | Cloudflare Worker | Serverless — holds the Anthropic API key |

The frontend never touches your Claude API key. It POSTs `{ prompt }` to the Worker's `/generate` endpoint; the Worker calls the Claude API and returns structured JSON.

**Generation is two-pass:**
1. **Author pass** — Claude drafts all nine rule formats as one JSON object (retries up to 3× if the JSON is malformed or a language block is missing).
2. **QA pass** — a second, independent Claude call reviews the draft for syntax correctness, cross-language consistency, and best practices, and returns a corrected version plus a `validation` verdict shown in the UI.

Schema and per-language authoring rules live in `worker/src/prompts.js` and `worker/src/schema.js` — the same place to look when adding a 10th language.

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- A [Cloudflare account](https://dash.cloudflare.com/) (free tier is enough) with [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI: `npm install -g wrangler`
- A GitHub repository to host this code

## 1. Deploy the Worker (backend)

```bash
cd worker
npm install
wrangler login
wrangler secret put ANTHROPIC_API_KEY    # paste your key when prompted
wrangler deploy
```

Wrangler prints a URL like `https://detection-rule-forge.<your-subdomain>.workers.dev`. Your generation endpoint is that URL + `/generate`.

Optional: edit `wrangler.toml` to change `MODEL_ID` or restrict `ALLOWED_ORIGIN` to your Pages domain instead of `*` once you know it.

## 2. Run the frontend locally

```bash
cd frontend
npm install
cp .env.example .env.local
# edit .env.local -> VITE_API_ENDPOINT=https://detection-rule-forge.<your-subdomain>.workers.dev/generate
npm run dev
```

## 3. Deploy the frontend to GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, set Source to **GitHub Actions**.
3. In **Settings → Secrets and variables → Actions**, add a repository secret:
   - `VITE_API_ENDPOINT` = your deployed Worker URL + `/generate`
4. Push to `main` (or run the workflow manually). `.github/workflows/deploy.yml` builds `frontend/` and publishes `frontend/dist` to Pages.

Your site will be live at `https://<your-username>.github.io/<repo>/`.

## Adding a new detection language

1. Add an entry to `LANGUAGES` in `frontend/src/lib/languages.js` (id, label, file extension, closest Prism syntax-highlighting grammar).
2. Add the same `id` under `languages` in the JSON shape and per-language authoring guidance in `worker/src/prompts.js`.
3. Add the id to `LANGUAGE_IDS` in `worker/src/schema.js` so it's structurally validated.

No other frontend code needs to change — tabs, code blocks, copy/download all render off that list.

## Notes on correctness

Generated rules are a strong first draft from a detection engineer's perspective, run through an automated review pass — they are **not** a substitute for testing against your own log schema, field names, and data volume before production deployment. Always validate against a real dataset first.

## License

MIT
