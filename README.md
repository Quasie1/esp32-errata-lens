# Errata Lens — ESP32

An agent that answers ESP32 questions by checking the **errata against the datasheet for your exact silicon revision**.

Built for the [DEV × Sanity Challenge](https://dev.to/challenges/sanity-2026-09-16), Path One.

```
esp32-errata-agent/
├── studio/   Sanity Studio: chip, chipRevision, erratum schemas + seed data (32 errata, 5 revisions)
└── app/      Next.js agent: Vercel AI SDK + Claude + two Sanity Context MCP endpoints
```

## How it works

| Layer | What it holds | Why it matters |
| --- | --- | --- |
| **Knowledge Base** (Context, KB mode) | ESP32 datasheet PDF + errata site (+ optional TRM) | The build flags every place the errata contradicts the datasheet as an **Issue**; you resolve it once and it sticks |
| **Errata database** (Context, GROQ mode) | `erratum` → `chipRevision` references, `fixedIn`, `introducedIn` | "Which bugs does *my* v1.1 have that v3.1 fixes?" is a join, not a keyword search |
| **`identifyRevision` tool** | Local parser | Turns esptool output / boot logs / module markings into a revision |

## Live setup (already done)

| Piece | Value |
| --- | --- |
| Sanity project / dataset | `ziyzznsh` / `production` (public) |
| Org | `oo0ts5x6x` |
| Knowledge Base | ESP32 Silicon Truth (`kbeTm4DzEg5S`): errata site + ESP-IDF peripheral docs, 23 entries |
| MCP endpoints | `esp32-kb` (Knowledge Base), `esp32-errata-db` (GROQ, filter `_type in ["chip","chipRevision","erratum"]`) |
| Studio | Registered as external at `http://localhost:3333` (run `npm run dev` in `studio/`) |

Remaining: create an org token with **Context → Viewer**, and put it plus your Anthropic key in `app/.env.local`.

> GROQ gotcha: through Context, filter revisions with `references("rev-esp32-v1-1")`, not `"v1.1" in affectedRevisions[]->name`, which returns nothing.

## Setup from scratch (≈30 min)

### 1. Sanity project + data
```bash
cd studio
echo "SANITY_STUDIO_PROJECT_ID=<your-project-id>" > .env
npm install
npx sanity login
npm run seed            # builds seed/esp32.ndjson and imports it
npm run schema:deploy   # required for Context GROQ mode
npm run deploy          # optional: hosted Studio
npx sanity dataset visibility set production public   # so judges can inspect it
```
Create the project first at sanity.io/manage (or `npx sanity init --bare`) to get the project ID.

### 2. Enable Context
sanity.io/manage → your organization → **Labs** → enable **Context** and **Knowledge Bases**.

### 3. Build the Knowledge Base
Dashboard → **Context** app → New Knowledge Base
- **Name:** ESP32 Silicon Truth
- **Purpose:** *Helps firmware and hardware engineers decide what the ESP32 actually does on a given silicon revision, where the errata overrides the datasheet or TRM.*
- **Sources:**
  - Website: `https://docs.espressif.com/projects/esp-chip-errata/en/latest/esp32/`
  - File: ESP32 datasheet PDF (`https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf`)
  - Optional file: ESP32 Technical Reference Manual PDF
  - Optional dataset: `*[_type=="erratum"]{errataId, title, category, fixedIn, introducedIn, "affected": affectedRevisions[]->name, sourceUrl}`
- Run the build. Open **Issues** and resolve datasheet/errata conflicts (choose the errata for the affected revisions). **Screenshot these for the post.**
- Add an instruction: *When the errata and datasheet disagree, the errata is ground truth for the revisions it lists; keep the datasheet claim alongside it.*

### 4. Create two Context MCP endpoints
- `esp32-kb` → Knowledge Base mode → ESP32 Silicon Truth
- `esp32-errata-db` → GROQ mode → your project, `production`, filter `_type in ["chip","chipRevision","erratum"]`

### 5. Token
Manage → Organization → API → Tokens → new token with **Context Viewer**.

### 6. Run the agent
```bash
cd app
cp .env.example .env.local   # fill in token, both MCP URLs, ANTHROPIC_API_KEY
npm install
npm run check:mcp            # should list kb + db tools
npm run dev                  # http://localhost:3000
```

### 7. Deploy
Push to GitHub → import in Vercel (root dir `app`) → add the same env vars.

## Demo questions
- *Can I use the internal pull-up on GPIO34–39 for a button?*
- *Reading a sensor on GPIO36 with Wi-Fi on, I get random low glitches. Why?* (GPIO-3.11)
- *Chip is ESP32-D0WD (revision v1.1). Is PSRAM safe?* (CPU-3.9)
- *Should we move from v1.1 to v3.1? What do we gain and what new bugs appear?* (fixes CPU-3.9/3.10, RES-3.8; introduces WDT-3.15)

## Credits
Errata data: Espressif Systems, [ESP32 Series SoC Errata](https://docs.espressif.com/projects/esp-chip-errata/en/latest/esp32/). Only IDs, titles and revision applicability are stored in the dataset; prose comes from the Knowledge Base with citations back to Espressif.
