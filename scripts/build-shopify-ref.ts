/**
 * Стискає офіційні дані довідки Shopify (vendor/theme-liquid-docs, MIT)
 * у два файли: повний індекс для сторінки «Shopify-довідник» (вантажиться
 * ліниво) і список імен (потрібен рушію для зрозумілих помилок).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const read = (name: string) => JSON.parse(readFileSync(`vendor/theme-liquid-docs/${name}.json`, 'utf8')) as any[]
const clean = (s: string = '') =>
  s.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/^>\s?.*$/gm, '').replace(/\s+/g, ' ').trim()
const types = (rt: any[] = []) => rt.map((t) => (t.array_value ? `array<${t.array_value}>` : t.type)).filter(Boolean).join(' | ')

const tags = read('tags').map((t) => ({
  name: t.name, category: t.category, deprecated: !!t.deprecated, summary: clean(t.summary),
  syntax: t.syntax ?? '', example: t.examples?.[0]?.raw_liquid ?? '',
  params: (t.parameters ?? []).map((p: any) => ({ name: p.name, types: p.types ?? [], required: !!p.required, summary: clean(p.description) })),
}))

const filters = read('filters').map((f) => ({
  name: f.name, category: f.category, deprecated: !!f.deprecated, summary: clean(f.summary),
  syntax: f.syntax ?? '', returns: types(f.return_type), example: f.examples?.[0]?.raw_liquid ?? '',
  params: (f.parameters ?? []).map((p: any) => ({ name: p.name, types: p.types ?? [], required: !!p.required, summary: clean(p.description) })),
}))

const objects = read('objects').map((o) => ({
  name: o.name, deprecated: !!o.deprecated, summary: clean(o.summary),
  global: !!o.access?.global, templates: o.access?.template ?? [], parents: (o.access?.parents ?? []).map((p: any) => `${p.object}.${p.property}`),
  properties: (o.properties ?? []).map((p: any) => ({ name: p.name, type: types(p.return_type), deprecated: !!p.deprecated, summary: clean(p.summary) })),
}))

mkdirSync('src/data', { recursive: true })
writeFileSync('src/data/shopify-ref.json', JSON.stringify({ tags, filters, objects }))
writeFileSync('src/data/shopify-names.json', JSON.stringify({
  tags: [...new Set(tags.map((t) => t.name))].sort(),
  filters: [...new Set(filters.map((f) => f.name))].sort(),
  objects: objects.map((o) => o.name).sort(),
}))
console.log(`tags ${tags.length}, filters ${filters.length}, objects ${objects.length}`)
