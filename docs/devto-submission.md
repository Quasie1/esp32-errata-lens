---
title: Errata Lens: an ESP32 agent that knows when the datasheet is wrong
published: false
tags: devchallenge, sanitychallenge, sanity, ai
---

*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16)*

## What I Built

**Errata Lens** answers ESP32 questions the way a careful senior engineer does: it checks whether the chip's **errata** overrides the **datasheet**, for the **exact silicon revision** on your board.

That last part is the whole problem. The ESP32 has shipped in five silicon revisions (v0.0 → v3.1). Some bugs were fixed in v1.0, some in v3.0, some were never fixed, and at least one (WDT-3.15, a live-lock watchdog issue) only *appears* on v3.x. The datasheet reads the same for all of them. Ask a normal chatbot "can I rely on GPIO36 as an input with Wi-Fi on?" and you get the datasheet answer, which is how people lose a week to an 80 ns glitch (GPIO-3.11).

I'm a computer engineering student who writes Verilog and firmware, and this is the tool I wanted on the bench.

**Try asking it:**
- "Reading a sensor on GPIO36 with Wi-Fi on, I get random low glitches. Why?"
- "Chip is ESP32-D0WD (revision v1.1). Is PSRAM safe?"
- "Should we move our product from v1.1 to v3.1? What do we gain and what new bugs do we get?"

## Demo

<!-- TODO: deployed URL + 60–90 s video: pick revision → ask GPIO36 question → expand the tool badges to show the GROQ query and KB entries → answer card -->

## Code

<!-- TODO: GitHub repo link -->

## How I Used Sanity

Two Sanity Context MCP endpoints, one per retrieval mode, because the problem has two halves.

**1. Knowledge Base mode: reconciling prose that disagrees.**
I pointed a Knowledge Base at the Espressif errata site (crawl) and the ESP32 datasheet PDF (upload). This is where Sanity Context earned its place: the build found places where the datasheet and errata disagree and raised them as **Issues**, with both claims side by side and their sources. I resolved each one (the errata wins for the revisions it lists) and added a standing instruction so rebuilds keep that decision.

<!-- TODO: screenshot of the Issues view with a datasheet vs errata conflict -->

The agent calls `initial_context` for the outline, then `knowledge_base_read` with several entry paths in one call to pull the datasheet claim, the erratum, and the workaround together.

**2. GROQ mode: revision math that a keyword search can't do.**
In the dataset, each `erratum` references the `chipRevision` documents it affects, plus `introducedIn` / `fixedIn`. Each revision stores its chip-marking letter, module code and eFuse signature. That turns questions into joins:

```groq
// Bugs on my v1.1 that v3.1 fixes
*[_type=="erratum" && "v1.1" in affectedRevisions[]->name
  && !("v3.1" in affectedRevisions[]->name)]{errataId, title}
```

Keyword search can find "PSRAM". It can't tell you that CPU-3.9 applies to your v1.0/v1.1 board but not v3.x, or that upgrading brings in WDT-3.15. Structure can.

**3. A small local tool** parses esptool output, ESP-IDF boot logs, and module markings (`MF`/`ME`/`MG`) into a revision, so users can paste what they already have.

**Answer shape.** Every answer has the same four parts: Answer → Datasheet says → Errata override (with erratum IDs + links) → Your revision. The UI shows each MCP call as an expandable badge, so you can see the GROQ query and which KB entries were read.

**Stack:** Next.js 16, Vercel AI SDK 6 (`@ai-sdk/mcp`), Claude, Sanity Studio 6.

## Sanity Project Details

<!-- TODO: Project ID: xxxxxxxx — dataset `production` (public) -->
Schema: `chip`, `chipRevision` (with `efuseSignature` object), `erratum`. 32 errata × 5 revisions, transcribed from Espressif's errata summary tables.

## Agent Session

<!-- Optional: upload Claude Code transcript at https://dev.to/agent_sessions/new, make public, embed -->

## Credits
Errata data © Espressif Systems, from the [ESP32 Series SoC Errata](https://docs.espressif.com/projects/esp-chip-errata/en/latest/esp32/). The dataset stores only IDs, titles and revision applicability; all prose comes from the Knowledge Base with citations back to Espressif.
