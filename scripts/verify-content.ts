/**
 * Прийомка контенту. Проганяє через рушій КОЖЕН приклад, рішення КОЖНОГО
 * завдання і КОЖЕН тест. Контент, що не пройшов, у збірку не йде.
 *
 *   pnpm verify                       — увесь контент (через реєстр src/content/index.ts)
 *   pnpm verify src/content/docs/x.ts — лише вказані файли (зручно, поки пишеш свій)
 */
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Block, DocPage, Example, InterviewQA, Lesson } from '../src/content/types'
import { renderLiquid } from '../src/engine/liquid'
import { checkExercise, quizAnswerMatches } from '../src/engine/check'

const errors: string[] = []
const warns: string[] = []
const seen = new Map<string, string>()
const stats = { pages: 0, lessons: 0, qa: 0, examples: 0, exercises: 0, quiz: 0 }

const fail = (where: string, msg: string) => errors.push(`✗ ${where}: ${msg}`)
const unique = (id: string, where: string) => {
  if (seen.has(id)) fail(where, `id «${id}» вже зайнятий у ${seen.get(id)}`)
  seen.set(id, where)
}

const INLINE_LINK = /\]\((\/[^)#]*)/g
const internalLinks: { where: string; href: string }[] = []
const collectLinks = (where: string, text?: string) => {
  if (!text) return
  for (const m of text.matchAll(INLINE_LINK)) internalLinks.push({ where, href: m[1] })
}

async function checkExample(where: string, ex: Example) {
  stats.examples++
  const r = await renderLiquid({ template: ex.template, data: ex.data, preset: ex.preset, snippets: ex.snippets })
  if (r.error && !ex.expectError) fail(where, `приклад падає: ${r.error.raw}\n    ${ex.template.split('\n')[0]}`)
  if (!r.error && ex.expectError) fail(where, 'expectError: true, але приклад відрендерився без помилки')
  if (!r.error && !ex.expectError && r.output.trim() === '' && !/assign|capture|comment|schema|doc|#/.test(ex.template)) {
    warns.push(`⚠ ${where}: приклад нічого не виводить — так задумано?`)
  }
  collectLinks(where, ex.note)
}

async function checkBlocks(where: string, blocks: Block[]) {
  if (!Array.isArray(blocks)) return fail(where, 'blocks має бути масивом')
  for (const [i, b] of blocks.entries()) {
    const at = `${where} › блок ${i + 1} (${b.type})`
    switch (b.type) {
      case 'example': await checkExample(at, b); break
      case 'p': case 'note': collectLinks(at, b.text); break
      case 'list': b.items.forEach((t) => collectLinks(at, t)); break
      case 'table':
        for (const row of b.rows) if (row.length !== b.head.length) fail(at, `у рядку ${row.length} клітинок, у шапці ${b.head.length}`)
        break
      case 'h': case 'code': break
      default: fail(at, `невідомий тип блока «${(b as { type: string }).type}»`)
    }
  }
}

async function checkPage(p: DocPage) {
  stats.pages++
  const where = `docs/${p.section}/${p.slug}`
  unique(where, where)
  if (!p.title || !p.summary) fail(where, 'потрібні title і summary')
  if (p.section === 'filters' && (!p.syntax || !p.category)) fail(where, 'фільтру потрібні syntax і category')
  if (!p.blocks.some((b) => b.type === 'example') && p.section !== 'shopify') fail(where, 'сторінка без жодного живого прикладу')
  await checkBlocks(where, p.blocks)
  for (const r of p.related ?? []) internalLinks.push({ where, href: `/docs/${r}` })
}

async function checkLesson(l: Lesson) {
  stats.lessons++
  const where = `course/${l.id}`
  unique(where, where)
  await checkBlocks(where, l.blocks)
  if (l.exercises.length < 3) warns.push(`⚠ ${where}: лише ${l.exercises.length} завдань (домовлялись про 3–5)`)
  for (const ex of l.exercises) {
    stats.exercises++
    const at = `${where} › ${ex.id}`
    unique(ex.id, at)
    if (!ex.hints?.length) fail(at, 'немає підказок')
    const ok = await checkExercise(ex, ex.solution)
    if (!ok.passed) fail(at, `ЕТАЛОН не проходить власну перевірку: ${ok.items.filter((i) => !i.ok).map((i) => i.label).join('; ')}`)
    const start = await checkExercise(ex, ex.starter)
    if (start.passed) fail(at, 'стартовий код уже проходить перевірку — завдання нема чого розвʼязувати')
    const ref = await renderLiquid({ template: ex.solution, data: ex.data, preset: ex.preset, snippets: ex.snippets })
    if (ex.altData) {
      const alt = await renderLiquid({ template: ex.solution, data: ex.altData, preset: ex.preset, snippets: ex.snippets })
      if (alt.error) fail(at, `еталон падає на altData: ${alt.error.raw}`)
      else if (alt.output === ref.output) warns.push(`⚠ ${at}: на altData вивід такий самий, як на data — приховану перевірку це не посилює`)
    }
    ex.task.forEach((t) => collectLinks(at, t))
  }
  for (const q of l.quiz) {
    stats.quiz++
    const at = `${where} › ${q.id}`
    unique(q.id, at)
    if (q.correct < 0 || q.correct >= q.options.length) fail(at, 'correct поза межами options')
    if (new Set(q.options).size !== q.options.length) fail(at, 'варіанти відповіді повторюються')
    const m = await quizAnswerMatches(q)
    if (!m.ok) fail(at, `«правильний» варіант ${JSON.stringify(q.options[q.correct])} не збігається з рушієм: ${JSON.stringify(m.output)}`)
  }
  for (const d of l.docs ?? []) internalLinks.push({ where, href: `/docs/${d}` })
}

async function checkQA(qa: InterviewQA) {
  stats.qa++
  const where = `interview/${qa.id}`
  unique(qa.id, where)
  if (!qa.short || qa.short.length < 60) fail(where, 'short закороткий: це має бути повна усна відповідь на 20–40 секунд')
  await checkBlocks(where, qa.blocks)
}

const isPage = (x: any): x is DocPage => x && typeof x.slug === 'string' && Array.isArray(x.blocks) && 'section' in x
const isLesson = (x: any): x is Lesson => x && Array.isArray(x.exercises) && Array.isArray(x.quiz)
const isQA = (x: any): x is InterviewQA => x && typeof x.q === 'string' && 'short' in x && 'topic' in x

async function walk(value: unknown) {
  if (Array.isArray(value)) { for (const v of value) await walk(v); return }
  if (isPage(value)) return checkPage(value)
  if (isLesson(value)) return checkLesson(value)
  if (isQA(value)) return checkQA(value)
}

const files = process.argv.slice(2)
const partial = files.length > 0
const targets = partial ? files : ['src/content/index.ts']
for (const file of targets) {
  const mod = await import(pathToFileURL(resolve(file)).href)
  for (const exported of Object.values(mod)) await walk(exported)
}

if (!partial) {
  // Посилання всередині сайту мають вести на сторінки, що існують.
  const known = new Set<string>([...seen.keys()].map((k) => `/${k.replace(/^course\//, 'learn/')}`))
  for (const extra of ['/', '/learn', '/docs', '/playground', '/interview', '/cheatsheet', '/shopify', '/shopify/reference', '/about']) known.add(extra)
  for (const l of internalLinks) {
    const href = l.href.replace(/\/$/, '') || '/'
    if (!known.has(href)) fail(l.where, `посилання на неіснуючу сторінку: ${l.href}`)
  }
}

for (const w of warns) console.log(w)
for (const e of errors) console.log(e)
console.log(`\nсторінок ${stats.pages} · уроків ${stats.lessons} · питань ${stats.qa} · прикладів ${stats.examples} · завдань ${stats.exercises} · тестів ${stats.quiz}`)
console.log(errors.length ? `\n${errors.length} помилок` : '\nУсе зелене ✓')
process.exit(errors.length ? 1 : 0)
