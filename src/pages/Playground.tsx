import { useMemo, useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Example, PresetId } from '@/content/types'
import { Runner } from '@/components/Runner'
import { decodeShare, encodeShare } from '@/lib/share'

const STARTERS: { label: string; example: Example }[] = [
  {
    label: 'Картка product',
    example: {
      preset: 'product', view: 'html',
      template: `{% assign variant = product.selected_or_first_available_variant %}
<article class="card">
  {{ product | image_url: width: 400 | image_tag: alt: product.title, loading: 'lazy' }}
  <h2>{{ product.title }}</h2>
  <p>
    {% if variant.compare_at_price > variant.price %}
      <s>{{ variant.compare_at_price | money }}</s>
      {% assign saved = variant.compare_at_price | minus: variant.price %}
      <strong>{{ variant.price | money }}</strong>
      <em>−{{ saved | times: 100 | divided_by: variant.compare_at_price }}%</em>
    {% else %}
      {{ variant.price | money }}
    {% endif %}
  </p>
  {% render 'stock', product: product %}
</article>`,
      snippets: { stock: `{% if product.available %}\n  <p>В наявності</p>\n{% else %}\n  <p>Немає в наявності</p>\n{% endif %}` },
    },
  },
  {
    label: 'Сітка колекції',
    example: {
      preset: 'collection',
      template: `{% assign available = collection.products | where: 'available' | sort: 'price' %}
{{ collection.title }}: {{ available.size }} з {{ collection.products_count }} у наявності

{% for product in available %}
  {{- forloop.index }}. {{ product.title }} — {{ product.price | money }} ({{ product.vendor }})
{% endfor %}
Бренди: {{ collection.products | map: 'vendor' | uniq | sort | join: ', ' }}`,
    },
  },
  {
    label: 'Кошик',
    example: {
      preset: 'cart',
      template: `{% for item in cart.items %}
{{ item.quantity }} × {{ item.title }} = {{ item.final_line_price | money }}
{%- if item.total_discount > 0 %} (знижка {{ item.total_discount | money }}){% endif %}
{% endfor %}
Разом: {{ cart.total_price | money_with_currency }}

{% assign left = 300000 | minus: cart.total_price %}
{% if left > 0 %}До безкоштовної доставки ще {{ left | money }}{% else %}Доставка безкоштовна{% endif %}`,
    },
  },
  {
    label: 'Секція зі схемою',
    example: {
      view: 'html',
      template: `<section style="padding: {{ section.settings.padding }}px">
  <h2>{{ section.settings.heading }}</h2>
  {% for block in section.blocks %}
    {% case block.type %}
      {% when 'text' %}<p {{ block.shopify_attributes }}>{{ block.settings.text }}</p>
      {% when 'button' %}<a href="{{ block.settings.link }}" {{ block.shopify_attributes }}>{{ block.settings.label }}</a>
    {% endcase %}
  {% endfor %}
</section>

{% schema %}
{
  "name": "Текст із кнопкою",
  "settings": [
    { "type": "text", "id": "heading", "label": "Заголовок", "default": "Догляд після процедури" },
    { "type": "range", "id": "padding", "label": "Відступ", "min": 0, "max": 80, "step": 4, "default": 24 }
  ],
  "blocks": [
    { "type": "text", "name": "Текст", "settings": [{ "type": "textarea", "id": "text", "label": "Текст", "default": "Новий абзац" }] },
    { "type": "button", "name": "Кнопка", "settings": [
      { "type": "text", "id": "label", "label": "Напис", "default": "Докладніше" },
      { "type": "url", "id": "link", "label": "Посилання", "default": "/collections/all" }
    ] }
  ],
  "presets": [{ "name": "Текст із кнопкою", "blocks": [{ "type": "text", "settings": { "text": "Перші 72 години вирішують усе." } }, { "type": "button" }] }]
}
{% endschema %}`,
    },
  },
  { label: 'Порожній', example: { template: '{{ "Привіт, Liquid" | upcase }}\n', data: { name: 'Олег' } } },
]

export function Playground() {
  const shared = useMemo(() => decodeShare(window.location.hash), [])
  const initial: Example = shared
    ? { template: shared.t, data: shared.d ? safeParse(shared.d) : undefined, preset: shared.p, snippets: shared.s, view: /<[a-z]/i.test(shared.t) ? 'html' : 'text' }
    : STARTERS[0].example
  const [example, setExample] = useState(initial)
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<{ template: string; dataText: string; preset?: PresetId; snippets: Record<string, string> } | null>(null)
  const [copied, setCopied] = useState(false)

  const load = (ex: Example) => { setExample(ex); setState(null); setVersion((v) => v + 1); history.replaceState(null, '', window.location.pathname) }

  const share = async () => {
    const s = state ?? { template: example.template, dataText: example.data ? JSON.stringify(example.data, null, 2) : '', preset: example.preset, snippets: example.snippets ?? {} }
    const hash = encodeShare({ t: s.template, d: s.dataText || undefined, p: s.preset, s: Object.keys(s.snippets).length ? s.snippets : undefined })
    history.replaceState(null, '', `#${hash}`)
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* адреса вже в рядку браузера */ }
  }

  return (
    <div className="page page--wide">
      <header className="page__head page__head--row">
        <div>
          <p className="eyebrow">Пісочниця</p>
          <h1>Шаблон, дані, сніпети</h1>
        </div>
        <div className="playbar">
          <div className="chips">
            {STARTERS.map((s) => <button key={s.label} className="chip" onClick={() => load(s.example)}>{s.label}</button>)}
          </div>
          <button className="btn" onClick={share}>{copied ? <><Check size={15} /> Посилання скопійовано</> : <><Link2 size={15} /> Посилання на цей код</>}</button>
        </div>
      </header>
      <Runner key={version} example={example} variant="full" onStateChange={setState} />
      <p className="muted playnote">Це LiquidJS з емуляцією Shopify, а не сервер Shopify. <Link to="/docs/basics/sandbox">Що саме відрізняється</Link>.</p>
    </div>
  )
}

function safeParse(s: string): Record<string, unknown> | undefined {
  try { return JSON.parse(s) as Record<string, unknown> } catch { return undefined }
}
