import { Liquid, toValue, type Context, type Emitter, type TagToken, type Template, type TopLevelToken } from 'liquidjs'

/**
 * ЕМУЛЯЦІЯ Shopify поверх LiquidJS. Це не Shopify: фільтри й теги тут
 * відтворюють ФОРМУ результату (щоб на них можна було вчитись), а не
 * інфраструктуру — CDN, переклади теми, справжні форми. Усе, що емулюється,
 * перелічене в EMULATED_FILTERS / EMULATED_TAGS і на сторінці «Про пісочницю».
 */

const CDN = '//liquid-lab.myshopify.com/cdn/shop'

type FilterThis = { context: Context; token: { args: unknown[]; getText(): string } }
type Kw = [string, unknown]

const isKw = (a: unknown): a is Kw => Array.isArray(a) && a.length === 2 && typeof a[0] === 'string'
const kwargs = (args: unknown[]) => Object.fromEntries(args.filter(isKw)) as Record<string, unknown>
const str = (v: unknown) => (v == null ? '' : String(toValue(v)))
const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* ───────── гроші ───────── */

function group(n: string, sep: string) {
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, sep)
}

function formatAmount(cents: number, kind: string): string {
  const neg = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const whole = String(Math.floor(abs / 100))
  const frac = String(Math.round(abs % 100)).padStart(2, '0')
  const rounded = String(Math.round(abs / 100))
  switch (kind) {
    case 'amount_no_decimals':
      return neg + group(rounded, ',')
    case 'amount_with_comma_separator':
      return neg + group(whole, '.') + ',' + frac
    case 'amount_no_decimals_with_comma_separator':
      return neg + group(rounded, '.')
    case 'amount_with_apostrophe_separator':
      return neg + group(whole, "'") + '.' + frac
    case 'amount_no_decimals_with_space_separator':
      return neg + group(rounded, ' ')
    case 'amount_with_space_separator':
      return neg + group(whole, ' ') + ',' + frac
    default:
      return neg + group(whole, ',') + '.' + frac
  }
}

function money(this: FilterThis, input: unknown, formatKey: 'money_format' | 'money_with_currency_format', trimZeros = false) {
  const cents = Number(toValue(input))
  if (input == null || Number.isNaN(cents)) return ''
  const fallback = formatKey === 'money_format' ? '${{amount}}' : '${{amount}} USD'
  const format = str(this.context.getSync(['shop', formatKey])) || fallback
  let out = format.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, kind: string) => formatAmount(cents, kind))
  if (trimZeros) out = out.replace(/[.,]00(?!\d)/, '')
  return out
}

/* ───────── зображення й адреси ───────── */

function imageSrc(input: unknown): string | null {
  const v = toValue(input) as unknown
  if (v == null) return null
  if (typeof v === 'string') return v
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    if (typeof o.src === 'string') return o.src
    for (const key of ['featured_image', 'image', 'preview_image', 'featured_media']) {
      const nested = imageSrc(o[key])
      if (nested) return nested
    }
  }
  return null
}

function withQuery(src: string, params: Record<string, unknown>) {
  const pairs = Object.entries(params)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
  return pairs.length ? `${src}${src.includes('?') ? '&' : '?'}${pairs.join('&')}` : src
}

function attrs(extra: Record<string, unknown>) {
  return Object.entries(extra)
    .filter(([, v]) => v != null && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escAttr(String(v))}"`))
    .join('')
}

/* ───────── переклади ───────── */

function translate(this: FilterThis, key: unknown, ...args: unknown[]) {
  const path = str(key)
  const locales = this.context.getSync(['locales']) as Record<string, unknown> | undefined
  const locale = str(this.context.getSync(['request', 'locale', 'iso_code'])) || 'en'
  let node: unknown = locales
  for (const part of path.replace(/^\./, '').split('.')) {
    node = node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined
  }
  const vars = kwargs(args)
  if (node && typeof node === 'object' && 'count' in vars) {
    const forms = node as Record<string, unknown>
    node = Number(vars.count) === 1 ? (forms.one ?? forms.other) : forms.other
  }
  // Поведінка Shopify: відсутній ключ не ламає сторінку, а друкує маркер.
  if (typeof node !== 'string') return `translation missing: ${locale}.${path.replace(/^\./, '')}`
  return node.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) => str(vars[name]))
}

export const EMULATED_FILTERS = [
  'money', 'money_with_currency', 'money_without_currency', 'money_without_trailing_zeros',
  'handleize', 'handle', 'pluralize', 'camelize', 'url_escape', 'url_param_escape',
  'image_url', 'img_url', 'image_tag', 'asset_url', 'asset_img_url', 'file_url', 'global_asset_url', 'shopify_asset_url',
  'stylesheet_tag', 'script_tag', 'preload_tag', 'link_to', 'time_tag', 'placeholder_svg_tag', 'highlight',
  't', 'translate', 'weight_with_unit', 'within', 'default_pagination', 'sort_by', 'url_for_vendor', 'url_for_type',
  'link_to_vendor', 'link_to_type', 'link_to_tag', 'item_count_for_variant',
] as const

export const EMULATED_TAGS = [
  'schema', 'doc', 'style', 'stylesheet', 'javascript', 'section', 'sections', 'content_for', 'form', 'paginate', 'layout',
] as const

export function registerShopifyFilters(engine: Liquid) {
  const reg = (name: string, fn: (this: FilterThis, ...a: never[]) => unknown) => engine.registerFilter(name, fn as never)

  reg('money', function (v: unknown) { return money.call(this, v, 'money_format') })
  reg('money_with_currency', function (v: unknown) { return money.call(this, v, 'money_with_currency_format') })
  reg('money_without_trailing_zeros', function (v: unknown) { return money.call(this, v, 'money_format', true) })
  reg('money_without_currency', function (v: unknown) {
    const cents = Number(toValue(v))
    return Number.isNaN(cents) ? '' : formatAmount(cents, 'amount')
  })

  const handleize = (v: unknown) =>
    str(v).toLowerCase().replace(/['’ʼ]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')
  reg('handleize', handleize)
  reg('handle', handleize)

  reg('pluralize', (count: unknown, singular: unknown, plural: unknown) => (Number(toValue(count)) === 1 ? str(singular) : str(plural)))
  reg('camelize', (v: unknown) =>
    str(v).split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(''))
  reg('url_escape', (v: unknown) => encodeURI(str(v)))
  reg('url_param_escape', (v: unknown) => encodeURIComponent(str(v)))

  reg('image_url', function (input: unknown, ...args: unknown[]) {
    const src = imageSrc(input)
    if (!src) return ''
    const kw = kwargs(args)
    // Справжній Shopify поводиться так само: без розміру — помилка, а не «оригінал».
    if (kw.width == null && kw.height == null) throw new Error('image_url: потрібен параметр width або height')
    return withQuery(src.includes('?v=') ? src : withQuery(src, { v: 1718000000 }), {
      width: kw.width, height: kw.height, crop: kw.crop, format: kw.format, pad_color: kw.pad_color,
    })
  })

  reg('img_url', (input: unknown, size: unknown) => {
    const src = imageSrc(input)
    if (!src) return ''
    const s = str(size) || 'small'
    return s === 'master' ? src : src.replace(/(\.[a-z0-9]+)(\?.*)?$/i, `_${s}$1$2`)
  })

  reg('image_tag', (input: unknown, ...args: unknown[]) => {
    const src = str(input)
    if (!src) return ''
    const kw = kwargs(args)
    const width = /[?&]width=(\d+)/.exec(src)?.[1]
    const height = /[?&]height=(\d+)/.exec(src)?.[1]
    return `<img src="${escAttr(src)}"${attrs({ alt: '', width, height, ...kw })}>`
  })

  reg('asset_url', (name: unknown) => `${CDN}/t/1/assets/${str(name)}?v=1718000000`)
  reg('asset_img_url', (name: unknown, size: unknown) =>
    `${CDN}/t/1/assets/${str(name).replace(/(\.[a-z0-9]+)$/i, `_${str(size) || 'small'}$1`)}?v=1718000000`)
  reg('file_url', (name: unknown) => `${CDN}/files/${str(name)}?v=1718000000`)
  reg('global_asset_url', (name: unknown) => `//cdn.shopify.com/s/global/${str(name)}`)
  reg('shopify_asset_url', (name: unknown) => `//cdn.shopify.com/s/shopify/${str(name)}`)

  reg('stylesheet_tag', (url: unknown, ...args: unknown[]) =>
    `<link href="${escAttr(str(url))}" rel="stylesheet" type="text/css" media="${escAttr(str(args.find((a) => !isKw(a)) ?? 'all'))}" />`)
  reg('script_tag', (url: unknown) => `<script src="${escAttr(str(url))}" type="text/javascript"></script>`)
  reg('preload_tag', (url: unknown, ...args: unknown[]) => `<link href="${escAttr(str(url))}" rel="preload"${attrs(kwargs(args))}>`)

  reg('link_to', (text: unknown, url: unknown, ...args: unknown[]) => {
    const title = args.find((a) => !isKw(a))
    return `<a href="${escAttr(str(url))}"${attrs({ title: title == null ? undefined : str(title), ...kwargs(args) })}>${str(text)}</a>`
  })

  reg('time_tag', function (input: unknown, ...args: unknown[]) {
    const date = new Date(str(input))
    if (Number.isNaN(date.getTime())) return str(input)
    const format = args.find((a) => !isKw(a))
    const dateFilter = (engine.filters as Record<string, unknown>).date
    const handler = (typeof dateFilter === 'function' ? dateFilter : (dateFilter as { handler: unknown }).handler) as (this: unknown, v: unknown, f: string) => string
    const text = handler.call(this, input, str(format) || '%B %d, %Y')
    return `<time datetime="${date.toISOString().replace('.000', '')}">${text}</time>`
  })

  reg('placeholder_svg_tag', (name: unknown, cls: unknown) =>
    `<svg class="${escAttr(str(cls) || 'placeholder-svg')}" data-placeholder="${escAttr(str(name))}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525 525"><rect width="525" height="525" fill="#e5e5e5"/></svg>`)

  reg('highlight', (text: unknown, terms: unknown) => {
    const t = str(terms).trim()
    if (!t) return str(text)
    const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return str(text).replace(re, '<strong class="highlight">$1</strong>')
  })

  reg('t', translate)
  reg('translate', translate)

  reg('weight_with_unit', (grams: unknown, unit: unknown) => {
    const g = Number(toValue(grams))
    const u = str(unit) || 'kg'
    const factor: Record<string, number> = { kg: 1000, g: 1, lb: 453.592, oz: 28.3495 }
    return `${+(g / (factor[u] ?? 1000)).toFixed(2)} ${u}`
  })

  reg('within', (url: unknown, collection: unknown) => {
    const c = toValue(collection) as { url?: string } | null
    return c?.url ? `${c.url}${str(url)}` : str(url)
  })
  reg('sort_by', (url: unknown, order: unknown) => withQuery(str(url), { sort_by: str(order) }))
  reg('url_for_vendor', (v: unknown) => `/collections/vendors?q=${encodeURIComponent(str(v))}`)
  reg('url_for_type', (v: unknown) => `/collections/types?q=${encodeURIComponent(str(v))}`)
  reg('link_to_vendor', (v: unknown) => `<a href="/collections/vendors?q=${encodeURIComponent(str(v))}" title="${escAttr(str(v))}">${str(v)}</a>`)
  reg('link_to_type', (v: unknown) => `<a href="/collections/types?q=${encodeURIComponent(str(v))}" title="${escAttr(str(v))}">${str(v)}</a>`)
  reg('link_to_tag', function (label: unknown, tag: unknown) {
    const base = str(this.context.getSync(['collection', 'url'])) || '/collections/all'
    return `<a href="${base}/${handleize(tag)}" title="Show products matching tag ${escAttr(str(tag))}">${str(label)}</a>`
  })
  reg('item_count_for_variant', (cart: unknown, variantId: unknown) => {
    const items = ((toValue(cart) as { items?: { id: number; quantity: number }[] } | null)?.items ?? [])
    return items.filter((i) => i.id === Number(toValue(variantId))).reduce((n, i) => n + i.quantity, 0)
  })

  reg('default_pagination', (p: unknown) => {
    const pg = toValue(p) as { parts?: { title: string; url: string; is_link: boolean }[]; previous?: { url: string }; next?: { url: string } } | null
    if (!pg?.parts) return ''
    const parts = pg.parts.map((x) => (x.is_link ? `<span class="page"><a href="${x.url}">${x.title}</a></span>` : `<span class="page current">${x.title}</span>`))
    if (pg.previous) parts.unshift(`<span class="prev"><a href="${pg.previous.url}">&laquo; Previous</a></span>`)
    if (pg.next) parts.push(`<span class="next"><a href="${pg.next.url}">Next &raquo;</a></span>`)
    return parts.join(' ')
  })

  /**
   * Ruby Liquid ділить ЦІЛЕ на ЦІЛЕ націло (`5 | divided_by: 2` → 2), LiquidJS — ні.
   * Це улюблене питання співбесід, тому тут поведінка Shopify. «Дробовість»
   * дільника видно лише з літерала (`2.0`): у JS 2.0 і 2 — те саме число.
   */
  reg('divided_by', function (input: unknown, divisor: unknown) {
    const a = Number(toValue(input))
    const b = Number(toValue(divisor))
    if (b === 0) throw new Error('divided by 0')
    const literal = /divided_by\s*:\s*(.+)$/s.exec(this.token.getText())?.[1] ?? ''
    const floatDivisor = /^-?\d+\.\d+/.test(literal.trim()) || !Number.isInteger(b)
    if (floatDivisor || !Number.isInteger(a)) return a / b
    return Math.floor(a / b)
  })
}

/* ───────── теги ───────── */

interface TagThis {
  liquid: Liquid
  templates: Template[]
  raw: string
  args: string
}

function parseBlock(self: TagThis, tagToken: TagToken, remain: TopLevelToken[], end: string) {
  self.templates = []
  const stream = self.liquid.parser.parseStream(remain)
    .on(`tag:${end}`, () => stream.stop())
    .on('template', (tpl: Template) => self.templates.push(tpl))
    .on('end', () => { throw new Error(`тег ${tagToken.getText()} не закрито — бракує {% ${end} %}`) })
  stream.start()
}

/** Вміст як сирий текст: JSON схеми чи документація не мають виконуватись. */
function parseRaw(self: TagThis, tagToken: TagToken, remain: TopLevelToken[], end: string) {
  const parts: string[] = []
  while (remain.length) {
    const token = remain.shift()!
    if ((token as TagToken).name === end) { self.raw = parts.join(''); return }
    parts.push(token.getText())
  }
  throw new Error(`тег ${tagToken.getText()} не закрито — бракує {% ${end} %}`)
}

export interface SectionSchema {
  name?: string
  settings?: { id?: string; type: string; default?: unknown }[]
  blocks?: { type: string; name?: string; settings?: { id?: string; default?: unknown }[] }[]
  presets?: { name?: string; settings?: Record<string, unknown>; blocks?: unknown }[]
  default?: { settings?: Record<string, unknown>; blocks?: unknown }
}

const SCHEMA_RE = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/

const defaults = (settings: { id?: string; default?: unknown }[] = []) =>
  Object.fromEntries(settings.filter((s) => s.id).map((s) => [s.id!, s.default ?? null]))

/**
 * Збирає обʼєкт `section` так, як його зібрав би редактор теми: значення
 * налаштувань — із `default` схеми, блоки — з першого пресета.
 */
export function sectionFromSchema(source: string, id = 'template--1__main'): Record<string, unknown> | null {
  const match = SCHEMA_RE.exec(source)
  if (!match) return null
  let schema: SectionSchema
  try { schema = JSON.parse(match[1]) as SectionSchema } catch { return null }
  const preset = schema.presets?.[0] ?? schema.default ?? {}
  const rawBlocks = preset.blocks
  const list: { type: string; settings?: Record<string, unknown> }[] = Array.isArray(rawBlocks)
    ? (rawBlocks as never)
    : rawBlocks && typeof rawBlocks === 'object' ? (Object.values(rawBlocks) as never) : []
  const blocks = list.map((b, i) => {
    const def = schema.blocks?.find((x) => x.type === b.type)
    const blockId = `block_${i + 1}`
    return {
      id: blockId,
      type: b.type,
      settings: { ...defaults(def?.settings), ...(b.settings ?? {}) },
      shopify_attributes: `data-shopify-editor-block="{&quot;id&quot;:&quot;${blockId}&quot;,&quot;type&quot;:&quot;${b.type}&quot;}"`,
    }
  })
  return { id, settings: { ...defaults(schema.settings), ...(preset.settings ?? {}) }, blocks, index: 1, location: 'template' }
}

const FORM_ACTIONS: Record<string, string> = {
  product: '/cart/add', cart: '/cart', contact: '/contact#contact_form', customer: '/contact#contact_form',
  customer_login: '/account/login', create_customer: '/account', recover_customer_password: '/account/recover',
  customer_address: '/account/addresses', new_comment: '#comment_form', localization: '/localization',
  guest_login: '/account/login', storefront_password: '/password', currency: '/cart/update',
}

export function registerShopifyTags(engine: Liquid, snippets: Record<string, string>) {
  engine.registerTag('schema', {
    parse(this: TagThis, token: TagToken, remain: TopLevelToken[]) {
      parseRaw(this, token, remain, 'endschema')
      try { JSON.parse(this.raw) } catch (e) {
        throw new Error(`у {% schema %} невалідний JSON: ${(e as Error).message}`)
      }
    },
    render() { /* схема — це дані для редактора теми, у HTML вона не потрапляє */ },
  } as never)

  engine.registerTag('doc', {
    parse(this: TagThis, token: TagToken, remain: TopLevelToken[]) { parseRaw(this, token, remain, 'enddoc') },
    render() {},
  } as never)

  // У Shopify вміст цих двох тегів збирається в спільні бандли теми й на місці не друкується.
  for (const name of ['stylesheet', 'javascript']) {
    engine.registerTag(name, {
      parse(this: TagThis, token: TagToken, remain: TopLevelToken[]) { parseRaw(this, token, remain, `end${name}`) },
      render() {},
    } as never)
  }

  engine.registerTag('style', {
    parse(this: TagThis, token: TagToken, remain: TopLevelToken[]) { parseBlock(this, token, remain, 'endstyle') },
    * render(this: TagThis, ctx: Context, emitter: Emitter) {
      emitter.write('<style data-shopify>')
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter)
      emitter.write('</style>')
    },
  } as never)

  engine.registerTag('layout', { parse() {}, render() {} } as never)
  engine.registerTag('sections', {
    parse(this: TagThis, token: TagToken) { this.args = token.args },
    render(this: TagThis) { return `<!-- sections ${this.args}: групи секцій пісочниця не рендерить -->` },
  } as never)

  const renderSection = async (name: string, ctx: Context) => {
    const source = snippets[`sections/${name}`] ?? snippets[name]
    if (source == null) throw new Error(`секцію '${name}' не знайдено — додай сніпет sections/${name}`)
    const id = name
    const section = sectionFromSchema(source, id) ?? { id, settings: {}, blocks: [] }
    // Як і в головному рендері: дані — глобальні, щоб {% render %} усередині секції їх бачив.
    const html = await engine.parseAndRender(source, {}, { globals: { ...(ctx.getAll() as object), section } })
    return `<div id="shopify-section-${id}" class="shopify-section">${html}</div>`
  }

  engine.registerTag('section', {
    parse(this: TagThis, token: TagToken) { this.args = token.args.trim().replace(/^['"]|['"]$/g, '') },
    * render(this: TagThis, ctx: Context) { return (yield renderSection(this.args, ctx)) as string },
  } as never)

  engine.registerTag('content_for', {
    parse(this: TagThis, token: TagToken) { this.args = token.args },
    * render(this: TagThis, ctx: Context) {
      const kind = /^['"](\w+)['"]/.exec(this.args.trim())?.[1]
      if (kind !== 'blocks') return `<!-- content_for ${this.args}: пісочниця рендерить лише 'blocks' -->`
      const blocks = (ctx.getSync(['section', 'blocks']) as { type: string }[] | undefined) ?? []
      let html = ''
      for (const block of blocks) {
        const source = snippets[`blocks/${block.type}`]
        if (source == null) { html += `<!-- блок '${block.type}': немає сніпета blocks/${block.type} -->`; continue }
        html += (yield engine.parseAndRender(source, {}, { globals: { ...(ctx.getAll() as object), block } })) as string
      }
      return html
    },
  } as never)

  engine.registerTag('form', {
    parse(this: TagThis, token: TagToken, remain: TopLevelToken[]) {
      this.args = token.args
      parseBlock(this, token, remain, 'endform')
    },
    * render(this: TagThis, ctx: Context, emitter: Emitter) {
      const type = /^\s*['"]([\w-]+)['"]/.exec(this.args)?.[1] ?? ''
      const extra: Record<string, unknown> = {}
      for (const m of this.args.matchAll(/([\w-]+)\s*:\s*('[^']*'|"[^"]*"|[\w.[\]]+)/g)) {
        extra[m[1]] = yield this.liquid.evalValue(m[2], ctx)
      }
      const action = FORM_ACTIONS[type] ?? '#'
      emitter.write(`<form method="post" action="${action}" accept-charset="UTF-8"${attrs({ id: extra.id, class: extra.class, ...extra })}${type === 'product' ? ' enctype="multipart/form-data"' : ''}>`)
      emitter.write(`<input type="hidden" name="form_type" value="${type}" /><input type="hidden" name="utf8" value="✓" />`)
      ctx.push({ form: { id: extra.id ?? `${type}_form`, errors: null, 'posted_successfully?': false } })
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter)
      ctx.pop()
      emitter.write('</form>')
    },
  } as never)

  engine.registerTag('paginate', {
    parse(this: TagThis, token: TagToken, remain: TopLevelToken[]) {
      this.args = token.args
      if (!/^.+?\s+by\s+\S+/.test(this.args.trim())) throw new Error('paginate: очікується `{% paginate масив by число %}`')
      parseBlock(this, token, remain, 'endpaginate')
    },
    * render(this: TagThis, ctx: Context, emitter: Emitter) {
      const [, expr, by] = /^(.+?)\s+by\s+(\S+)/.exec(this.args.trim())!
      const all = ((yield this.liquid.evalValue(expr, ctx)) as unknown[] | undefined) ?? []
      const bySize = (yield this.liquid.evalValue(by, ctx)) as unknown
      const pageSize = Math.max(1, Number(bySize) || 50)
      const pages = Math.max(1, Math.ceil(all.length / pageSize))
      const current = Math.min(pages, Math.max(1, Number(ctx.getSync(['current_page'])) || 1))
      const offset = (current - 1) * pageSize
      const link = (n: number, title = String(n)) => ({ title, url: `?page=${n}`, is_link: true })
      const paginate = {
        current_page: current, current_offset: offset, items: all.length, page_size: pageSize, pages,
        parts: Array.from({ length: pages }, (_, i) => (i + 1 === current ? { title: String(i + 1), url: '', is_link: false } : link(i + 1))),
        previous: current > 1 ? link(current - 1, '&laquo; Previous') : undefined,
        next: current < pages ? link(current + 1, 'Next &raquo;') : undefined,
      }
      // Усередині тега той самий шлях (collection.products) має віддавати вже СТОРІНКУ.
      const path = expr.trim().split('.')
      const page = all.slice(offset, offset + pageSize)
      let override: unknown = page
      for (let i = path.length - 1; i >= 1; i--) {
        const parent = (yield this.liquid.evalValue(path.slice(0, i).join('.'), ctx)) as object
        override = { ...parent, [path[i]]: override }
      }
      ctx.push({ [path[0]]: override, paginate })
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter)
      ctx.pop()
    },
  } as never)
}
