import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { StaticCode } from '@/components/StaticCode'
import { EMULATED_FILTERS, EMULATED_TAGS } from '@/engine/shopify'
import { docs } from '@/content'
import { Link } from 'react-router-dom'

type Ref = typeof import('@/data/shopify-ref.json')
type Uk = typeof import('@/data/shopify-ref-uk')
type Kind = 'filters' | 'tags' | 'objects'

const KIND_LABELS: Record<Kind, string> = { filters: 'Фільтри', tags: 'Теги', objects: 'Обʼєкти' }
const emulated = new Set<string>([...EMULATED_FILTERS, ...EMULATED_TAGS])
const ownPages = new Set(docs.filter((d) => d.section === 'filters').map((d) => d.slug))

export function ShopifyReference() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState<{ ref: Ref; uk: Uk } | null>(null)
  const kind = (params.get('kind') as Kind) || 'filters'
  const q = params.get('q') ?? ''
  const [open, setOpen] = useState<string | null>(q || null)

  useEffect(() => {
    Promise.all([import('@/data/shopify-ref.json'), import('@/data/shopify-ref-uk')]).then(([ref, uk]) => setData({ ref: ref.default as unknown as Ref, uk }))
  }, [])

  const set = (next: Record<string, string>) => setParams({ kind, q, ...next }, { replace: true })

  const groups = useMemo(() => {
    if (!data) return []
    const needle = q.trim().toLowerCase()
    const uk = kind === 'filters' ? data.uk.filtersUk : kind === 'tags' ? data.uk.tagsUk : data.uk.objectsUk
    const items = (data.ref[kind] as { name: string; category?: string; global?: boolean; summary: string; deprecated: boolean }[])
      .filter((x) => !needle || x.name.includes(needle) || (uk[x.name] ?? '').toLowerCase().includes(needle))
    const by = new Map<string, typeof items>()
    for (const it of items) {
      const g = kind === 'objects' ? (it.global ? 'глобальні — доступні всюди' : 'доступні на своїх сторінках або через інші обʼєкти') : it.category ?? ''
      by.set(g, [...(by.get(g) ?? []), it])
    }
    return [...by.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [data, kind, q])

  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">Shopify · повний індекс</p>
        <h1>Усе, що є в Liquid на Shopify</h1>
        <p className="page__lead">Перелік узято з офіційних даних довідки Shopify (репозиторій <code className="ic">theme-liquid-docs</code>, MIT). Українські описи — наші; синтаксис, параметри й властивості — як в оригіналі.</p>
      </header>

      <div className="refbar">
        <div className="tabs tabs--solid" role="tablist">
          {(Object.keys(KIND_LABELS) as Kind[]).map((k) => (
            <button key={k} role="tab" aria-selected={kind === k} className="tabs__tab" onClick={() => { setOpen(null); setParams({ kind: k, q: '' }, { replace: true }) }}>
              {KIND_LABELS[k]} {data && <span className="count">{data.ref[k].length}</span>}
            </button>
          ))}
        </div>
        <input className="input" placeholder="Фільтр за імʼям або описом" value={q} onChange={(e) => set({ q: e.target.value })} aria-label="Пошук в індексі" />
      </div>

      {!data && <p className="muted">Завантажую індекс…</p>}
      {data && groups.length === 0 && <p className="muted">Нічого не знайдено за «{q}».</p>}

      {groups.map(([group, items]) => (
        <section key={group} className="refgroup">
          <h2>{group}</h2>
          <ul className="reflist">
            {items.map((it) => {
              const uk = (kind === 'filters' ? data!.uk.filtersUk : kind === 'tags' ? data!.uk.tagsUk : data!.uk.objectsUk)[it.name]
              const isOpen = open === it.name
              const full = it as unknown as { syntax?: string; returns?: string; example?: string; params?: { name: string; types: string[]; required: boolean; summary: string }[]; properties?: { name: string; type: string; deprecated: boolean; summary: string }[]; templates?: string[]; parents?: string[] }
              return (
                <li key={`${group}:${it.name}`} className={`ref${isOpen ? ' ref--open' : ''}`}>
                  <button className="ref__row" onClick={() => setOpen(isOpen ? null : it.name)} aria-expanded={isOpen}>
                    <code className={`ref__name ref__name--${kind}`}>{it.name}</code>
                    <span className="ref__sum">{uk ?? it.summary}</span>
                    <span className="ref__flags">
                      {it.deprecated && <span className="flag flag--dep">deprecated</span>}
                      {kind !== 'objects' && (emulated.has(it.name) || ownPages.has(it.name)) && <span className="flag flag--live">працює в пісочниці</span>}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="ref__body">
                      {uk && <p className="ref__en">{it.summary}</p>}
                      {full.syntax && <pre className="syntax"><code>{full.syntax}</code></pre>}
                      {full.returns && <p className="muted">Повертає: <code className="ic">{full.returns}</code></p>}
                      {!!full.params?.length && (
                        <div className="tablewrap"><table><thead><tr><th>Параметр</th><th>Тип</th><th>Опис</th></tr></thead><tbody>
                          {full.params.map((p) => <tr key={p.name}><td><code className="ic">{p.name}</code>{p.required ? ' *' : ''}</td><td>{p.types.join(' | ')}</td><td>{p.summary}</td></tr>)}
                        </tbody></table></div>
                      )}
                      {!!full.templates?.length && <p className="muted">Доступний у шаблонах: {full.templates.join(', ')}</p>}
                      {!!full.parents?.length && <p className="muted">Приходить через: {full.parents.slice(0, 8).map((p) => <code key={p} className="ic">{p}</code>)}</p>}
                      {!!full.properties?.length && (
                        <div className="tablewrap"><table><thead><tr><th>Властивість</th><th>Тип</th><th>Опис (оригінал)</th></tr></thead><tbody>
                          {full.properties.map((p) => <tr key={p.name} className={p.deprecated ? 'is-dep' : ''}><td><code className="ic">{it.name}.{p.name}</code></td><td>{p.type}</td><td>{p.summary}</td></tr>)}
                        </tbody></table></div>
                      )}
                      {full.example && <StaticCode code={full.example} title="Приклад з офіційної довідки" />}
                      <p className="ref__links">
                        {ownPages.has(it.name) && kind === 'filters' && <Link to={`/docs/filters/${it.name}`} className="chip chip--accent">Наша сторінка з живими прикладами</Link>}
                        <a className="chip" href={`https://shopify.dev/docs/api/liquid/${kind}/${it.name}`} target="_blank" rel="noreferrer">shopify.dev <ExternalLink size={13} /></a>
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
