import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { docs, docsBySection, findDoc, SECTION_LABELS } from '@/content'
import type { DocSection } from '@/content/types'
import { Blocks, headingsOf } from '@/components/Blocks'
import { InlineMd } from '@/components/InlineMd'

export function DocsIndex({ sections = ['basics', 'tags', 'filters'] as DocSection[], shopify = false }) {
  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">{shopify ? 'Shopify' : 'Довідник'}</p>
        <h1>{shopify ? 'Liquid у темі Shopify' : 'Уся мова — з живими прикладами'}</h1>
        <p className="page__lead">
          {shopify
            ? 'Обʼєкти магазину, архітектура теми, секції зі схемою — те, чого немає в «чистому» Liquid і про що найбільше питають на співбесідах.'
            : 'Ті самі розділи, що й в офіційній документації Liquid, — але кожен приклад можна змінити й одразу побачити результат.'}
        </p>
      </header>
      {shopify && (
        <Link to="/shopify/reference" className="refbanner">
          <strong>Повний індекс Shopify</strong>
          <span>31 тег · 154 фільтри · 142 обʼєкти з усіма властивостями — пошук за імʼям, позначки застарілого</span>
          <ArrowRight size={18} />
        </Link>
      )}
      {sections.map((s) => {
        const pages = docsBySection(s)
        if (!pages.length) return <section key={s} className="docgroup"><h2>{SECTION_LABELS[s]}</h2><p className="muted">Розділ ще пишеться.</p></section>
        return (
          <section key={s} className="docgroup">
            <h2>{SECTION_LABELS[s]} <span className="count">{pages.length}</span></h2>
            <div className={`doccards${s === 'filters' ? ' doccards--dense' : ''}`}>
              {pages.map((d) => (
                <Link key={d.slug} to={`/docs/${s}/${d.slug}`} className="doccard">
                  <span className={`doccard__title${s === 'filters' ? ' is-mono' : ''}`}>{d.title}</span>
                  <span className="doccard__sum"><InlineMd text={d.summary.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')} /></span>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function DocPageView() {
  const { section = '', slug = '' } = useParams()
  const page = findDoc(section, slug)
  if (!page) return <div className="page"><h1>Сторінку не знайдено</h1><p className="muted">Можливо, вона ще пишеться.</p><Link to="/docs">До довідника</Link></div>

  const siblings = docs.filter((d) => d.section === page.section)
  const i = siblings.indexOf(page)
  const prev = siblings[i - 1]
  const next = siblings[i + 1]
  const toc = headingsOf(page.blocks)

  return (
    <article className="page page--doc" key={`${section}/${slug}`}>
      <header className="page__head">
        <p className="eyebrow"><Link to={page.section === 'shopify' ? '/shopify' : '/docs'}>{SECTION_LABELS[page.section]}</Link></p>
        <h1 className={page.section === 'filters' ? 'is-mono' : ''}>{page.title}</h1>
        <p className="page__lead"><InlineMd text={page.summary} /></p>
        {page.syntax && <pre className="syntax"><code>{page.syntax}</code></pre>}
      </header>

      <div className="doclayout">
        <Blocks blocks={page.blocks} />
        {toc.length > 2 && (
          <aside className="toc" aria-label="На цій сторінці">
            <p className="toc__head">На сторінці</p>
            {toc.map((h) => <a key={h.id} href={`#${h.id}`}>{h.text}</a>)}
          </aside>
        )}
      </div>

      <footer className="lessonfoot">
        <div className="lessonfoot__links">
          {page.related?.map((r) => <Link key={r} to={`/docs/${r}`} className="chip">{r.split('/')[1]}</Link>)}
          {page.officialUrl && <a className="chip" href={page.officialUrl} target="_blank" rel="noreferrer">Офіційна документація <ExternalLink size={13} /></a>}
        </div>
        <div className="pager">
          {prev ? <Link to={`/docs/${prev.section}/${prev.slug}`} className="pager__link"><ArrowLeft size={16} /> {prev.title}</Link> : <span />}
          {next ? <Link to={`/docs/${next.section}/${next.slug}`} className="pager__link pager__link--next">{next.title} <ArrowRight size={16} /></Link> : <span />}
        </div>
      </footer>
    </article>
  )
}
