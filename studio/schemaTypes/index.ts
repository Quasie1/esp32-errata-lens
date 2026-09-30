import {defineArrayMember, defineField, defineType} from 'sanity'

export const chip = defineType({
  name: 'chip',
  title: 'Chip',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'vendor', type: 'string'}),
    defineField({name: 'datasheetUrl', title: 'Datasheet URL', type: 'url'}),
    defineField({name: 'errataUrl', title: 'Errata URL', type: 'url'}),
    defineField({
      name: 'revisions',
      description: 'Silicon revisions, oldest first',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'chipRevision'}]})],
    }),
  ],
})

export const efuseSignature = defineType({
  name: 'efuseSignature',
  title: 'eFuse signature',
  type: 'object',
  description: 'Bit values that identify this revision',
  fields: [
    defineField({name: 'apbCtrlDate31', title: 'APB_CTRL_DATE[31]', type: 'number'}),
    defineField({name: 'blk0Rdata5Bit20', title: 'EFUSE_BLK0_RDATA5[20]', type: 'number'}),
    defineField({name: 'blk0Rdata3Bit15', title: 'EFUSE_BLK0_RDATA3[15]', type: 'number'}),
    defineField({name: 'blk0Rdata5Bit25', title: 'EFUSE_BLK0_RDATA5[25]', type: 'number'}),
    defineField({name: 'blk0Rdata5Bit24', title: 'EFUSE_BLK0_RDATA5[24]', type: 'number'}),
  ],
})

export const chipRevision = defineType({
  name: 'chipRevision',
  title: 'Chip revision',
  type: 'document',
  fields: [
    defineField({name: 'chip', type: 'reference', to: [{type: 'chip'}], validation: (r) => r.required()}),
    defineField({name: 'name', type: 'string', description: 'vM.X, e.g. v3.1', validation: (r) => r.required()}),
    defineField({name: 'major', type: 'number'}),
    defineField({name: 'minor', type: 'number'}),
    defineField({name: 'sortOrder', type: 'number', description: '0 = oldest'}),
    defineField({name: 'chipMarking', type: 'string', description: 'Espressif tracking line on the chip package'}),
    defineField({name: 'chipMarkingLetter', type: 'string', description: 'The letter in position 2 of the tracking line (B, F, E, G)'}),
    defineField({name: 'moduleMarking', type: 'string', description: 'Specification identifier on the module shield'}),
    defineField({name: 'efuse', type: 'efuseSignature'}),
  ],
  preview: {select: {title: 'name', subtitle: 'chipMarking'}},
  orderings: [{title: 'Oldest first', name: 'sortAsc', by: [{field: 'sortOrder', direction: 'asc'}]}],
})

export const erratum = defineType({
  name: 'erratum',
  title: 'Erratum',
  type: 'document',
  fields: [
    defineField({name: 'chip', type: 'reference', to: [{type: 'chip'}], validation: (r) => r.required()}),
    defineField({name: 'errataId', title: 'Errata ID', type: 'string', description: 'e.g. GPIO-3.11', validation: (r) => r.required()}),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: ['CPU', 'ULP', 'GPIO', 'Reset', 'Clock', 'RTC', 'Watchdog', 'UART', 'TWAI', 'LEDC']},
    }),
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'affectedRevisions',
      description: 'Silicon revisions this bug exists on',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'chipRevision'}]})],
    }),
    defineField({name: 'affectsAllRevisions', type: 'boolean', description: 'Never fixed in silicon'}),
    defineField({name: 'introducedIn', type: 'string', description: 'First affected revision, if not v0.0'}),
    defineField({name: 'fixedIn', type: 'string', description: 'First revision where the bug is gone'}),
    defineField({name: 'sourceUrl', title: 'Source URL', type: 'url'}),
  ],
  preview: {select: {title: 'errataId', subtitle: 'title'}},
})

export const schemaTypes = [chip, efuseSignature, chipRevision, erratum]
