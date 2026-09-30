// Generates seed/esp32.ndjson for `sanity dataset import`.
// Usage: node seed/build-seed.mjs && npx sanity dataset import seed/esp32.ndjson production --replace
import {writeFileSync} from 'node:fs'
import {revisions, errata, ERRATA_BASE} from './errata-data.mjs'

const order = revisions.map((r) => r.name)
const revId = (name) => `rev-esp32-${name.replace('.', '-')}`
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const docs = []

docs.push({
  _id: 'chip-esp32',
  _type: 'chip',
  name: 'ESP32',
  vendor: 'Espressif',
  errataUrl: 'https://docs.espressif.com/projects/esp-chip-errata/en/latest/esp32/',
  datasheetUrl: 'https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf',
  revisions: revisions.map((r) => ({_type: 'reference', _ref: revId(r.name), _key: slug(r.name)})),
})

for (const r of revisions) {
  const [date31, rdata5_20, rdata3_15, rdata5_25, rdata5_24] = r.efuse
  docs.push({
    _id: revId(r.name),
    _type: 'chipRevision',
    chip: {_type: 'reference', _ref: 'chip-esp32'},
    name: r.name,
    major: r.major,
    minor: r.minor,
    sortOrder: order.indexOf(r.name),
    chipMarking: r.chipMarking,
    chipMarkingLetter: r.chipMarkingLetter ?? undefined,
    moduleMarking: r.moduleMarking,
    efuse: {
      _type: 'efuseSignature',
      apbCtrlDate31: date31,
      blk0Rdata5Bit20: rdata5_20,
      blk0Rdata3Bit15: rdata3_15,
      blk0Rdata5Bit25: rdata5_25,
      blk0Rdata5Bit24: rdata5_24,
    },
  })
}

for (const [id, category, title, affected, path] of errata) {
  const idx = affected.map((a) => order.indexOf(a))
  const last = Math.max(...idx)
  const first = Math.min(...idx)
  const fixedIn = last < order.length - 1 ? order[last + 1] : undefined
  const introducedIn = first > 0 ? order[first] : undefined
  docs.push({
    _id: `erratum-esp32-${slug(id)}`,
    _type: 'erratum',
    chip: {_type: 'reference', _ref: 'chip-esp32'},
    errataId: id,
    category,
    title,
    affectedRevisions: affected.map((a) => ({_type: 'reference', _ref: revId(a), _key: slug(a)})),
    affectsAllRevisions: affected.length === order.length,
    fixedIn,
    introducedIn,
    sourceUrl: `${ERRATA_BASE}/${path}.html`,
  })
}

writeFileSync(new URL('./esp32.ndjson', import.meta.url), docs.map((d) => JSON.stringify(d)).join('\n') + '\n')
console.log(`Wrote ${docs.length} documents (${errata.length} errata, ${revisions.length} revisions)`)
