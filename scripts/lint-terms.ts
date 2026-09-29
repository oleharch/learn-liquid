/**
 * Лінтер термінології. Правила — GLOSSARY.md. Дивиться ЛИШЕ в прозу контенту
 * (тексти, заголовки, підказки, відповіді), а не в шаблони й код: там живе UI
 * магазину («Додати в кошик»), і він має бути українським.
 *
 *   pnpm lint:terms                          — увесь контент + src/data/shopify-ref-uk.ts
 *   pnpm lint:terms src/content/docs/x.ts    — лише вказані файли
 *
 * Помилки (обовʼязкові заміни) → код виходу 1. Попередження — на розсуд автора.
 */
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Block, CourseModule, DocPage, InterviewQA, Lesson } from '../src/content/types'

type Level = 'error' | 'warn'
interface Rule { re: RegExp; use: string; level: Level }

// `\b` у JS не знає кирилиці, тому межі слова — через lookaround по літерах.
const w = (s: string) => new RegExp(`(?<!\\p{L})(?:${s})`, 'giu')

const RULES: Rule[] = [
  { re: w('област[ьі] видимост\\p{L}*'), use: 'scope', level: 'error' },
  { re: w('вивід|вивод(?:у|ом|і)(?!\\p{L})'), use: 'output', level: 'error' },
  // Лише дієслово (друкує, надрукований); іменник «друк» — це print, він легальний.
  { re: w('(?:на|ви|роз)?друк(?!(?:у|ом)?(?!\\p{L}))\\p{L}*'), use: 'виводить / рендерить (output)', level: 'error' },
  { re: w('керуванн[яі] пробілами'), use: 'whitespace control', level: 'error' },
  { re: w('пробільн\\p{L}*'), use: 'whitespace', level: 'error' },
  { re: w('налагодж\\p{L}*'), use: 'debugging / дебажити', level: 'error' },
  { re: w('продуктивн\\p{L}*'), use: 'performance', level: 'error' },
  { re: w('макет\\p{L}*'), use: 'layout', level: 'error' },
  { re: w('застарі\\p{L}*'), use: 'deprecated', level: 'error' },
  { re: w('метапол\\p{L}*'), use: 'metafield', level: 'error' },
  { re: w('метаобʼ?є?\'?кт\\p{L}*'), use: 'metaobject', level: 'error' },
  { re: w('налаштуванн\\p{L}* теми'), use: 'theme settings', level: 'error' },
  { re: w('посторінков\\p{L}*|пагінаці\\p{L}*'), use: 'pagination', level: 'error' },

  { re: w('товар\\p{L}*'), use: 'product — якщо це обʼєкт/дані; «товар» лишається лише для речі на полиці', level: 'warn' },
  { re: w('кошик\\p{L}*'), use: 'cart — якщо про обʼєкт і його дані', level: 'warn' },
  { re: w('клієнт\\p{L}*|покупц\\p{L}*|покупець'), use: 'customer — якщо про обʼєкт', level: 'warn' },
  { re: w('позиці\\p{L}* кошика|позиці(?:я|ї|ю|єю|ям|ями|ях)(?!\\p{L})'), use: 'line item', level: 'warn' },
  { re: w('рядок|рядк(?:а|у|и|ів|ом|ами|ах)(?!\\p{L})'), use: 'string — якщо тип даних; «рядок коду» лишається', level: 'warn' },
  { re: w('ресурс\\p{L}*'), use: 'assets — якщо про папку assets/; resource → «ресурс» ок', level: 'warn' },
  { re: w('дробов\\p{L}*'), use: 'float', level: 'warn' },
  { re: w('ціл(?:е|і|их|ого|им|ими) числ\\p{L}*'), use: 'integer', level: 'warn' },
]

const hits: { level: Level; where: string; text: string; rule: Rule }[] = []

function scan(where: string, text: string | undefined) {
  if (!text) return
  // Код у бектиках — ідентифікатори, не проза. Пояснення в дужках одразу після
  // латинського терміна — «scope (область видимості)» — дозволена перша згадка.
  const prose = text.replace(/`[^`]*`/g, '`…`').replace(/([A-Za-z]+(?: [A-Za-z]+)*) \(([^)]*)\)/g, '$1 (…)')
  // Кожен збіг окремо: калька, повторена в тому самому абзаці, теж має бути видна.
  for (const rule of RULES) {
    for (const m of prose.matchAll(rule.re)) {
      const from = Math.max(0, m.index - 30)
      const snippet = prose.slice(from, m.index + m[0].length + 30).replace(/\s+/g, ' ')
      hits.push({ level: rule.level, where, text: `…${snippet}…  →  ${rule.use}`, rule })
    }
  }
}

function scanBlocks(where: string, blocks: Block[]) {
  for (const [i, b] of blocks.entries()) {
    const at = `${where} › блок ${i + 1} (${b.type})`
    switch (b.type) {
      case 'p': case 'h': scan(at, b.text); break
      case 'list': b.items.forEach((t) => scan(at, t)); break
      case 'note': scan(at, b.title); scan(at, b.text); break
      case 'example': scan(at, b.title); scan(at, b.note); break
      case 'code': scan(at, b.title); break
      case 'table': b.head.forEach((h) => scan(at, h)); b.rows.forEach((r) => r.forEach((c) => scan(at, c))); break
    }
  }
}

const isPage = (x: any): x is DocPage => x && typeof x.slug === 'string' && Array.isArray(x.blocks) && 'section' in x
const isLesson = (x: any): x is Lesson => x && Array.isArray(x.exercises) && Array.isArray(x.quiz)
const isQA = (x: any): x is InterviewQA => x && typeof x.q === 'string' && 'short' in x && 'topic' in x
const isModule = (x: any): x is CourseModule => x && typeof x.id === 'number' && typeof x.summary === 'string'

function walk(value: unknown, file: string) {
  if (Array.isArray(value)) { value.forEach((v) => walk(v, file)); return }
  if (isPage(value)) {
    const where = `docs/${value.section}/${value.slug}`
    scan(where, value.title); scan(where, value.summary); scanBlocks(where, value.blocks)
  } else if (isLesson(value)) {
    const where = `course/${value.id}`
    scan(where, value.title); scan(where, value.goal); scanBlocks(where, value.blocks)
    for (const ex of value.exercises) {
      const at = `${where} › ${ex.id}`
      scan(at, ex.title); ex.task.forEach((t) => scan(at, t)); ex.hints.forEach((h) => scan(at, h)); scan(at, ex.explain)
      ex.mustUse?.forEach((r) => scan(at, r.label)); ex.mustNotUse?.forEach((r) => scan(at, r.label))
    }
    for (const q of value.quiz) { scan(`${where} › ${q.id}`, q.q); scan(`${where} › ${q.id}`, q.explain) }
  } else if (isQA(value)) {
    const where = `interview/${value.id}`
    scan(where, value.q); scan(where, value.short); scanBlocks(where, value.blocks)
    for (const f of value.followUps ?? []) {
      if (typeof f === 'string') scan(`${where} › followUp`, f)
      else { scan(`${where} › followUp`, f.q); scan(`${where} › followUp`, f.a) }
    }
  } else if (isModule(value)) {
    scan(`module ${value.id}`, value.title); scan(`module ${value.id}`, value.summary)
  } else if (value && typeof value === 'object') {
    // Словники описів (shopify-ref-uk.ts): ключ → рядок.
    for (const [k, v] of Object.entries(value)) if (typeof v === 'string') scan(`${file} › ${k}`, v)
  }
}

const files = process.argv.slice(2)
const targets = files.length ? files : ['src/content/index.ts', 'src/content/course/modules.ts', 'src/data/shopify-ref-uk.ts']
for (const file of targets) {
  const mod = await import(pathToFileURL(resolve(file)).href)
  for (const exported of Object.values(mod)) walk(exported, file)
}

const errors = hits.filter((h) => h.level === 'error')
const warnings = hits.filter((h) => h.level === 'warn')
for (const h of warnings) console.log(`⚠ ${h.where}\n    ${h.text}`)
for (const h of errors) console.log(`✗ ${h.where}\n    ${h.text}`)
console.log(`\n${errors.length} помилок · ${warnings.length} попереджень`)
process.exit(errors.length ? 1 : 0)
