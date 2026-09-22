import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { docsBySection } from '@/content'
import type { FilterCategory } from '@/content/types'
import { InlineMd } from '@/components/InlineMd'
import { StaticCode } from '@/components/StaticCode'
import { renderLiquid } from '@/engine/liquid'

const CATS: Record<FilterCategory, string> = { string: 'Рядки', math: 'Числа', array: 'Масиви', date: 'Дати', other: 'Інше' }

const SYNTAX: { title: string; code: string }[] = [
  { title: 'Вивід, тег, фільтр', code: `{{ product.title | upcase }}\n{% if product.available %}…{% endif %}\n{%- assign x = 1 -%}   {%- # дефіс зʼїдає пробіли з цього боку -%}` },
  { title: 'Умови', code: `{% if a == 1 and b or c %}   {%- # and/or — СПРАВА НАЛІВО, дужок немає -%}\n{% elsif a contains 'x' %}\n{% else %}\n{% endif %}\n\n{% unless product.available %}…{% endunless %}\n\n{% case product.type %}\n  {% when 'Маска', 'Шампунь' %}…\n  {% else %}…\n{% endcase %}` },
  { title: 'Цикли', code: `{% for p in collection.products limit: 4 offset: 2 reversed %}\n  {{ forloop.index }} {{ forloop.first }} {{ forloop.last }} {{ forloop.length }}\n  {% if p.hidden %}{% continue %}{% endif %}\n  {% break %}\n{% else %}\n  колекція порожня\n{% endfor %}\n\n{% for i in (1..5) %}{{ i }}{% endfor %}\n{% cycle 'odd', 'even' %}\n{% tablerow p in products cols: 3 %}…{% endtablerow %}` },
  { title: 'Змінні', code: `{% assign title = product.title | downcase %}\n{% capture label %}{{ title }} — {{ price }}{% endcapture %}   {%- # завжди рядок -%}\n{% increment n %} {% decrement n %}   {%- # друкують значення; окремий простір імен -%}` },
  { title: 'Шаблон', code: `{% render 'card', product: p, show_vendor: true %}   {%- # ізольована область видимості -%}\n{% render 'card' for products as p %}\n{% comment %}…{% endcomment %}   {% # інлайн-коментар %}\n{% raw %}{{ не виконується }}{% endraw %}\n{% liquid\n  assign x = 5\n  echo x | plus: 1\n%}` },
  { title: 'Truthy / falsy і порожнеча', code: `falsy: лише nil і false\ntruthy: усе інше — зокрема "", 0, порожній масив\n\n{% if title != blank %}   {%- # nil, "", "   ", [] -%}\n{% if products == empty %} {%- # "", [] -%}\n{% if products.size > 0 %}` },
]

export function Cheatsheet() {
  // Контент статичний, але docsBySection() щоразу віддає НОВИЙ масив.
  // Без useMemo ефект нижче перезапускався б на кожен рендер — і не спинявся.
  const filters = useMemo(() => docsBySection('filters'), [])
  const [q, setQ] = useState('')
  const [outputs, setOutputs] = useState<Record<string, string>>({})

  const firstExample = useMemo(() => Object.fromEntries(filters.map((d) => [d.slug, d.blocks.find((b) => b.type === 'example' && !b.expectError)])), [filters])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const next: Record<string, string> = {}
      for (const d of filters) {
        const ex = firstExample[d.slug]
        if (ex?.type !== 'example') continue
        const r = await renderLiquid({ template: ex.template, data: ex.data, preset: ex.preset, snippets: ex.snippets })
        next[d.slug] = r.error ? '' : r.output.trim()
      }
      if (alive) setOutputs(next)
    })()
    return () => { alive = false }
  }, [filters, firstExample])

  const needle = q.trim().toLowerCase()

  return (
    <div className="page page--wide">
      <header className="page__head">
        <p className="eyebrow">Шпаргалка</p>
        <h1>Уся мова на одній сторінці</h1>
        <p className="page__lead">Синтаксис тегів і всі фільтри з першим прикладом зі своєї сторінки. Вивід порахований рушієм щойно, а не вписаний.</p>
      </header>

      <section className="sheet">
        {SYNTAX.map((s) => <StaticCode key={s.title} title={s.title} code={s.code} />)}
      </section>

      <div className="refbar">
        <h2>Фільтри <span className="count">{filters.length}</span></h2>
        <input className="input" placeholder="Швидкий пошук фільтра" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Пошук фільтра" />
      </div>
      {!filters.length && <p className="muted">Сторінки фільтрів ще пишуться.</p>}

      {(Object.keys(CATS) as FilterCategory[]).map((cat) => {
        const list = filters.filter((d) => (d.category ?? 'other') === cat && (!needle || d.slug.includes(needle) || d.summary.toLowerCase().includes(needle)))
        if (!list.length) return null
        return (
          <section key={cat} className="refgroup">
            <h2>{CATS[cat]}</h2>
            <div className="tablewrap">
              <table className="sheettable">
                <thead><tr><th>Фільтр</th><th>Що робить</th><th>Приклад</th><th>Вивід</th></tr></thead>
                <tbody>
                  {list.map((d) => {
                    const ex = firstExample[d.slug]
                    return (
                      <tr key={d.slug}>
                        <td><Link to={`/docs/filters/${d.slug}`} className="mono filterlink">{d.slug}</Link></td>
                        <td><InlineMd text={d.summary.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')} /></td>
                        <td>{ex?.type === 'example' && <code className="sheetcode">{ex.template.length > 140 ? `${ex.template.slice(0, 140)}…` : ex.template}</code>}</td>
                        <td><code className="sheetcode sheetcode--out">{outputs[d.slug] ?? ''}</code></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}
