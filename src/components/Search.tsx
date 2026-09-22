import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { docs, interview, lessons, SECTION_LABELS } from '@/content'

interface Hit { to: string; title: string; sub: string; kind: string; hay: string }

const strip = (s: string) => s.replace(/[`*]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

export function Search({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [refHits, setRefHits] = useState<Hit[]>([])
  const input = useRef<HTMLInputElement>(null)

  const base = useMemo<Hit[]>(() => [
    ...docs.map((d) => ({ to: `/docs/${d.section}/${d.slug}`, title: d.title, sub: strip(d.summary), kind: SECTION_LABELS[d.section], hay: `${d.slug} ${d.title} ${d.summary}`.toLowerCase() })),
    ...lessons.map((l) => ({ to: `/learn/${l.id}`, title: l.title, sub: strip(l.goal), kind: `Урок ${l.id.slice(1)}`, hay: `${l.title} ${l.goal}`.toLowerCase() })),
    ...interview.map((x) => ({ to: `/interview?q=${x.id}`, title: x.q, sub: strip(x.short).slice(0, 140), kind: 'Співбесіда', hay: `${x.q} ${x.short}`.toLowerCase() })),
  ], [])

  useEffect(() => {
    input.current?.focus()
    // Повний індекс Shopify важкий — підтягуємо його лише коли відкрили пошук.
    Promise.all([import('@/data/shopify-ref.json'), import('@/data/shopify-ref-uk')]).then(([ref, uk]) => {
      const r = ref.default
      setRefHits([
        ...r.filters.map((f) => ({ to: `/shopify/reference?q=${f.name}&kind=filters`, title: f.name, sub: uk.filtersUk[f.name] ?? f.summary, kind: 'Shopify · фільтр', hay: f.name })),
        ...r.objects.map((o) => ({ to: `/shopify/reference?q=${o.name}&kind=objects`, title: o.name, sub: uk.objectsUk[o.name] ?? o.summary, kind: 'Shopify · обʼєкт', hay: o.name })),
        ...r.tags.map((t) => ({ to: `/shopify/reference?q=${t.name}&kind=tags`, title: t.name, sub: uk.tagsUk[t.name] ?? t.summary, kind: 'Shopify · тег', hay: t.name })),
      ])
    })
  }, [])

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return base.slice(0, 8)
    const score = (h: Hit) => (h.title.toLowerCase() === needle ? 0 : h.title.toLowerCase().startsWith(needle) ? 1 : h.title.toLowerCase().includes(needle) ? 2 : 3)
    const seen = new Set<string>()
    return [...base, ...refHits]
      .filter((h) => h.hay.includes(needle))
      .sort((a, b) => score(a) - score(b))
      .filter((h) => { const k = `${h.kind}:${h.title}`; if (seen.has(k)) return false; seen.add(k); return true })
      .slice(0, 30)
  }, [q, base, refHits])

  useEffect(() => setActive(0), [q])

  const go = (h?: Hit) => { if (h) { navigate(h.to); onClose() } }

  return (
    <div className="search" role="dialog" aria-modal="true" aria-label="Пошук" onClick={onClose}>
      <div className="search__box" onClick={(e) => e.stopPropagation()}>
        <input ref={input} className="search__input" placeholder="where, forloop, render, схема секції…" value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
            if (e.key === 'Enter') go(hits[active])
          }} />
        <ul className="search__list">
          {hits.map((h, i) => (
            <li key={h.to + h.title}>
              <button className={`search__hit${i === active ? ' is-active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => go(h)}>
                <span className="search__kind">{h.kind}</span>
                <span className="search__title">{h.title}</span>
                <span className="search__sub">{h.sub}</span>
              </button>
            </li>
          ))}
          {hits.length === 0 && <li className="search__none">Нічого не знайшлось. Спробуй імʼя фільтра або тега англійською.</li>}
        </ul>
      </div>
    </div>
  )
}
