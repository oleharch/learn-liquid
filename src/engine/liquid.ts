import { Context, Filter, Liquid, Value, toValue } from 'liquidjs'
import type { PresetId } from '@/content/types'
import names from '@/data/shopify-names.json'
import { presetData } from './presets'
import { EMULATED_FILTERS, EMULATED_TAGS, registerShopifyFilters, registerShopifyTags, sectionFromSchema } from './shopify'

export interface RenderInput {
  template: string
  data?: Record<string, unknown>
  preset?: PresetId
  snippets?: Record<string, string>
  /** Записати проміжні значення кожного ланцюжка фільтрів. */
  trace?: boolean
}

export interface LiquidProblem {
  /** Людське пояснення українською. */
  message: string
  /** Оригінальний текст помилки рушія. */
  raw: string
  line?: number
  col?: number
}

/**
 * Значення в трасуванні показується ДВІЧІ: коротким підписом у рядку
 * ланцюжка і повним JSON на вимогу. Без цього масив товарів вивалював
 * у панель кілька екранів тексту, і зміну значення ставало не видно.
 */
export interface TraceValue {
  kind: 'nil' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'other'
  /** Один рядок: `масив · 3 обʼєкти`, `"Шампунь…"`, `64900`. */
  label: string
  /** Повне значення для розгортання; немає — коли підпис уже все сказав. */
  full?: string
}

export interface TraceStep {
  /** Текст фільтра, як у шаблоні: `append: "!"`. */
  source: string
  name: string
  output: TraceValue
}

export interface TraceChain {
  /** Вираз цілком: `product.title | upcase | truncate: 10`. */
  source: string
  line: number
  initial: TraceValue
  steps: TraceStep[]
}

export interface RenderResult {
  output: string
  error?: LiquidProblem
  ms: number
  trace?: TraceChain[]
}

/* ───────── трасування ланцюжків фільтрів ─────────
 * LiquidJS обчислює `a | f | g` у Value.value(), викликаючи Filter.render()
 * по черзі. Обгортаємо обидва методи: перший відкриває «кадр» ланцюжка,
 * другий дописує в нього крок. Поза трасованим рендером обгортки — прозорі.
 */

let collector: TraceChain[] | null = null
const frames: TraceChain[] = []
const MAX_CHAINS = 60

const PLURAL = (n: number, one: string, few: string, many: string) => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

const quote = (s: string, max: number) => {
  const flat = s.replace(/\n/g, '↵')
  return `"${flat.length > max ? `${flat.slice(0, max)}…` : flat}"`
}

const scalarLabel = (v: unknown): string | null => {
  if (v === null || v === undefined) return 'nil'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (typeof v === 'string') return quote(v, 46)
  return null
}

function traceValue(raw: unknown): TraceValue {
  const v = toValue(raw) as unknown
  if (v === null || v === undefined) return { kind: 'nil', label: 'nil' }
  if (typeof v === 'boolean') return { kind: 'boolean', label: String(v) }
  if (typeof v === 'number') return { kind: 'number', label: String(v) }
  if (typeof v === 'string') {
    const flat = v.replace(/\n/g, '↵')
    return { kind: 'string', label: quote(v, 70), full: flat.length > 70 ? v : undefined }
  }
  if (v instanceof Date) return { kind: 'other', label: v.toISOString() }

  const full = () => {
    try {
      const text = JSON.stringify(v, null, 1)
      return text.length > 6000 ? `${text.slice(0, 6000)}\n…обрізано` : text
    } catch {
      return String(v)
    }
  }

  if (Array.isArray(v)) {
    const n = v.length
    if (n === 0) return { kind: 'array', label: 'порожній масив' }
    const scalars = v.map(scalarLabel)
    // Масив коротких скалярів показуємо цілком — саме так видно роботу split, map, uniq.
    if (scalars.every((x) => x !== null)) {
      const inline = `[${scalars.slice(0, 6).join(', ')}${n > 6 ? `, …ще ${n - 6}` : ''}]`
      return { kind: 'array', label: inline.length > 96 ? `масив · ${n} ${PLURAL(n, 'елемент', 'елементи', 'елементів')}` : inline, full: full() }
    }
    const objects = v.every((x) => x !== null && typeof toValue(x) === 'object')
    return {
      kind: 'array',
      label: `масив · ${n} ${objects ? PLURAL(n, 'обʼєкт', 'обʼєкти', 'обʼєктів') : PLURAL(n, 'елемент', 'елементи', 'елементів')}`,
      full: full(),
    }
  }

  if (typeof v === 'object') {
    const keys = Object.keys(v as object)
    if (keys.length === 0) return { kind: 'object', label: 'порожній обʼєкт' }
    const head = keys.slice(0, 4).join(', ')
    return { kind: 'object', label: `обʼєкт { ${head}${keys.length > 4 ? `, …ще ${keys.length - 4}` : ''} }`, full: full() }
  }

  return { kind: 'other', label: String(v) }
}

type AnyGen = (this: unknown, ...args: unknown[]) => Generator<unknown, unknown, unknown>
type FilterLike = { name: string; token: { input: string; begin: number; end: number; getText(): string } }

let patched = false
function patchOnce() {
  if (patched) return
  patched = true
  const valueProto = Value.prototype as unknown as { value: AnyGen }
  const filterProto = Filter.prototype as unknown as { render: AnyGen }
  const origValue = valueProto.value
  const origRender = filterProto.render

  valueProto.value = function* (this: unknown, ...args: unknown[]) {
    const filters = (this as { filters: FilterLike[] }).filters
    if (!collector || filters.length === 0 || collector.length >= MAX_CHAINS) return yield* origValue.apply(this, args)
    const first = filters[0].token
    const last = filters[filters.length - 1].token
    const open = Math.max(first.input.lastIndexOf('{{', first.begin), first.input.lastIndexOf('{%', first.begin))
    const source = first.input.slice(open < 0 ? 0 : open, last.end).replace(/^\{[{%]-?\s*/, '').trim()
    const chain: TraceChain = { source, line: first.input.slice(0, first.begin).split('\n').length, initial: { kind: 'nil', label: 'nil' }, steps: [] }
    frames.push(chain)
    try {
      return yield* origValue.apply(this, args)
    } finally {
      frames.pop()
      if (chain.steps.length && collector) collector.push(chain)
    }
  }

  filterProto.render = function* (this: unknown, ...args: unknown[]) {
    const out = yield* origRender.apply(this, args)
    const chain = frames[frames.length - 1]
    if (collector && chain) {
      const self = this as FilterLike
      if (chain.steps.length === 0) chain.initial = traceValue(args[0])
      chain.steps.push({ source: self.token.getText().trim(), name: self.name, output: traceValue(out) })
    }
    return out
  }
}

/* ───────── forloop.parentloop ─────────
 * У Shopify вкладений цикл дістає зовнішній через `forloop.parentloop`,
 * і це стандартне питання співбесіди. LiquidJS такої властивості не має,
 * а сам ForloopDrop із пакета не експортується — тож чіпляємось до того
 * місця, де рушій КЛАДЕ forloop у контекст: на момент push попередній
 * forloop у контексті і є батьківським. Знімати нічого не треба —
 * контекст сам викидає область видимості наприкінці циклу.
 */
{
  const proto = Context.prototype as unknown as {
    push: (scope: unknown) => unknown
    getSync: (path: string[]) => unknown
  }
  const origPush = proto.push
  proto.push = function (scope: unknown) {
    if (scope && typeof scope === 'object' && 'forloop' in (scope as object)) {
      const parent = (this as unknown as { getSync: (p: string[]) => unknown }).getSync(['forloop'])
      if (parent) (scope as { forloop: Record<string, unknown> }).forloop.parentloop = parent
    }
    return origPush.call(this, scope)
  }
}

/* ───────── рушій ───────── */

function createEngine(snippets: Record<string, string>) {
  const engine = new Liquid({
    templates: snippets,
    // Невідомий фільтр — помилка, а не мовчазний пропуск: так вчитись чесніше.
    strictFilters: true,
    // Дати друкуються у своєму часовому поясі, а не в поясі браузера — вивід однаковий у всіх.
    preserveTimezones: true,
    // Запобіжники від «вічного» шаблону: вкладка не має зависати.
    parseLimit: 200_000,
    renderLimit: 2_000,
    memoryLimit: 8_000_000,
  })
  registerShopifyFilters(engine)
  registerShopifyTags(engine, snippets)
  return engine
}

const SHOPIFY_FILTERS = new Set(names.filters)
const SHOPIFY_TAGS = new Set(names.tags)
const EMULATED = new Set<string>([...EMULATED_FILTERS, ...EMULATED_TAGS])

function explain(raw: string): string {
  let m: RegExpExecArray | null
  if ((m = /undefined filter: (\w+)/.exec(raw))) {
    return SHOPIFY_FILTERS.has(m[1]) && !EMULATED.has(m[1])
      ? `Фільтр \`${m[1]}\` існує в Shopify, але пісочниця його не емулює — перевіряй його на справжній темі.`
      : `Невідомий фільтр \`${m[1]}\`. Перевір написання: імена фільтрів — малими літерами з підкресленням.`
  }
  if ((m = /tag "?(\w+)"? not found/.exec(raw))) {
    return SHOPIFY_TAGS.has(m[1])
      ? `Тег \`${m[1]}\` існує в Shopify, але пісочниця його не емулює.`
      : `Невідомий тег \`${m[1]}\`. Можливо, зайвий \`end…\` або одруківка.`
  }
  if (/not closed/.test(raw)) return `Тег не закрито: кожному \`{% if %}\`, \`{% for %}\`, \`{% capture %}\` потрібен свій \`{% end… %}\`.`
  if (/output "?.*"? not closed|not closed.*\{\{/.test(raw)) return 'Вивід `{{ … }}` не закрито — бракує `}}`.'
  if (/memory alloc limit|render limit|parse.*limit/.test(raw)) return 'Шаблон надто важкий: завеликий діапазон циклу або обсяг даних. Пісочниця обриває такі рендери, щоб вкладка не зависла.'
  if (/divided by 0/.test(raw)) return 'Ділення на нуль. У Shopify це теж помилка: `Liquid error: divided by 0`.'
  if (/illegal (tag|filter|output)/i.test(raw) || /unexpected/i.test(raw)) return 'Синтаксична помилка: рушій не зміг розібрати цей фрагмент.'
  if (/Failed to lookup|ENOENT/.test(raw)) return 'Сніпет не знайдено. Додай його у вкладці «Сніпети» під тим самим імʼям, що в `{% render %}`.'
  return raw
}

function toProblem(e: unknown): LiquidProblem {
  const err = e as { message?: string; originalError?: { message?: string }; token?: { getPosition?: () => [number, number] } }
  const raw = (err.originalError?.message || err.message || String(e)).replace(/, line:\d+, col:\d+$/, '')
  let line: number | undefined
  let col: number | undefined
  const pos = /line:(\d+), col:(\d+)/.exec(err.message ?? '')
  if (pos) { line = +pos[1]; col = +pos[2] } else {
    const p = err.token?.getPosition?.()
    if (p) [line, col] = p
  }
  return { message: explain(raw), raw, line, col }
}

// Трасовані рендери йдуть суворо по одному: збирач — змінна модуля.
let traceQueue: Promise<unknown> = Promise.resolve()

export function buildScope(input: RenderInput): Record<string, unknown> {
  const scope: Record<string, unknown> = { ...presetData(input.preset), ...(input.data ? structuredClone(input.data) : {}) }
  if (!('section' in scope)) {
    const section = sectionFromSchema(input.template)
    if (section) scope.section = section
  }
  return scope
}

async function run(input: RenderInput): Promise<RenderResult> {
  const started = performance.now()
  try {
    const engine = createEngine(input.snippets ?? {})
    // Дані йдуть у `globals`, а не в звичайну область видимості: саме так
    // поводиться Shopify — усередині {% render %} обʼєкти сторінки (shop,
    // product, settings) ВИДНО, а змінні з {% assign %} — ні.
    const output = await engine.parseAndRender(input.template, {}, { globals: buildScope(input) })
    return { output: String(output), ms: performance.now() - started }
  } catch (e) {
    return { output: '', error: toProblem(e), ms: performance.now() - started }
  }
}

export function renderLiquid(input: RenderInput): Promise<RenderResult> {
  if (input.trace) patchOnce()
  // У черзі йдуть УСІ рендери: звичайний, що вклинився б у трасований, насмітив би в його журнал.
  const job = traceQueue.then(async () => {
    if (!input.trace) return run(input)
    collector = []
    frames.length = 0
    try {
      const result = await run(input)
      return { ...result, trace: collector ?? [] }
    } finally {
      collector = null
    }
  })
  traceQueue = job.catch(() => undefined)
  return job
}

