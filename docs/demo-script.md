# Demo video script (about 75 seconds)

Record with the Windows Snipping Tool (Win+Shift+R → Record) or OBS. Browser at 100% zoom, dark theme.

| Time | On screen | Say (or caption) |
| --- | --- | --- |
| 0:00–0:08 | App home page | "The ESP32 shipped in five silicon revisions. The datasheet reads the same for all of them. The errata doesn't." |
| 0:08–0:15 | Set Silicon revision to **v1.1** | "Pick the revision on your board, or paste your esptool output." |
| 0:15–0:35 | Click the **GPIO36 Wi-Fi glitches** example; let the badges stream | "It reads the Sanity Knowledge Base outline, queries the errata database, then reads the relevant entries." |
| 0:35–0:45 | Expand the **Queried errata database** badge to show the GROQ | "Revision filtering is a real join on structured data, not a keyword match." |
| 0:45–0:55 | Scroll the answer: GPIO-3.11, workaround, "applies to v1.1" | "It cites the erratum, the workaround, and whether your revision is affected." |
| 0:55–1:08 | Cut to the Sanity Context **Issues** page (SPI conflict) | "When sources disagree, 40 versus 26.6 MHz here, Sanity Context flags it at build time and my decision sticks across rebuilds." |
| 1:08–1:15 | Back to the app, ask the **v1.1 → v3.1** example (can be pre-recorded) | "Upgrade questions become exact: three bugs fixed, one new." |

Tips
- Run both questions once before recording so you know the timing.
- Trim the waiting in an editor (Clipchamp is built into Windows).
- Upload to YouTube as Unlisted, then embed with `{% embed <url> %}`.
