import {tool} from 'ai'
import {z} from 'zod'

export const REVISIONS = ['v0.0', 'v1.0', 'v1.1', 'v3.0', 'v3.1'] as const
export type Revision = (typeof REVISIONS)[number]

const MARKING_LETTER: Record<string, Revision> = {B: 'v1.0', F: 'v1.1', E: 'v3.0', G: 'v3.1'}
const MODULE_CODE: Record<string, Revision> = {MF: 'v1.1', ME: 'v3.0', MG: 'v3.1'}

export type RevisionGuess = {revision: Revision | null; candidates: Revision[]; evidence: string}

/**
 * Deterministic parser for the ways people actually tell you their silicon revision:
 * esptool output, ESP-IDF boot logs, module shield codes, chip tracking letters.
 */
export function parseRevision(text: string): RevisionGuess {
  const t = text.trim()

  // "chip revision: v3.1", "(revision v3.1)", "rev v1.1", "Chip rev: v3.0"
  const vmx = t.match(/rev(?:ision)?[:\s]*\(?\s*v?(\d)\.(\d)\b/i)
  if (vmx) {
    const r = `v${vmx[1]}.${vmx[2]}` as Revision
    if (REVISIONS.includes(r)) return {revision: r, candidates: [r], evidence: `found "${vmx[0]}"`}
  }

  // Older esptool: "(revision 1)" / "(revision 3)" — major only
  const major = t.match(/revision\s*\(?\s*(\d)\s*\)?(?![.\d])/i)
  if (major) {
    const m = major[1]
    const candidates = REVISIONS.filter((r) => r.startsWith(`v${m}.`))
    if (candidates.length === 1) return {revision: candidates[0], candidates, evidence: `major revision ${m}`}
    if (candidates.length) return {revision: null, candidates, evidence: `major revision ${m}; minor unknown`}
  }

  // "ESP32-D0WD-V3" part numbers imply major revision 3
  if (/ESP32-[A-Z0-9]+-V3\b/i.test(t)) return {revision: null, candidates: ['v3.0', 'v3.1'], evidence: 'V3 part number; minor unknown'}

  // Module specification identifier, e.g. "MG 2345"
  const mod = t.match(/\b(M[FEG])\s?\d{0,4}\b/)
  if (mod) {
    const r = MODULE_CODE[mod[1]]
    return {revision: r, candidates: [r], evidence: `module marking ${mod[1]}`}
  }

  // Chip tracking line: 8 chars, revision letter in position 2
  const track = t.match(/\b[A-Z0-9]([BFEG])[A-Z0-9]{6}\b/)
  if (track) {
    const r = MARKING_LETTER[track[1]]
    return {revision: r, candidates: [r], evidence: `chip tracking letter ${track[1]}`}
  }

  return {revision: null, candidates: [...REVISIONS], evidence: 'no revision found'}
}

export const identifyRevision = tool({
  description:
    'Identify the ESP32 silicon revision from something the user pasted: esptool output, an ESP-IDF boot log, a module shield marking (MF/ME/MG) or the chip tracking line. Call this before filtering errata whenever the user gives such text.',
  inputSchema: z.object({text: z.string().describe('The raw text the user pasted')}),
  execute: async ({text}) => parseRevision(text),
})
