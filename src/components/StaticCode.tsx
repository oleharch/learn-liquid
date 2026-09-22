import { highlightLiquid } from '@/lib/highlight'

export function StaticCode({ code, lang = 'liquid', title }: { code: string; lang?: string; title?: string }) {
  const liquidish = lang === 'liquid' || lang === 'html'
  return (
    <figure className="scode">
      {title && <figcaption className="scode__title">{title}</figcaption>}
      <pre className="scode__pre" data-lang={lang}>
        <code>
          {liquidish
            ? highlightLiquid(code).map((t, i) => <span key={i} className={`tk tk--${t.kind}`}>{t.text}</span>)
            : code}
        </code>
      </pre>
    </figure>
  )
}
