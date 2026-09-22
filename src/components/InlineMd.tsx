import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

const RE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)]+\))/g

/** Міні-розмітка контенту: `код`, **жирний**, *курсив*, [текст](url). */
export function InlineMd({ text }: { text: string }) {
  const out: ReactNode[] = []
  let last = 0
  let key = 0
  for (const m of text.matchAll(RE)) {
    if (m.index > last) out.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
    const s = m[0]
    if (m[1]) out.push(<code key={key++} className="ic">{s.slice(1, -1)}</code>)
    else if (m[2]) out.push(<strong key={key++}><InlineMd text={s.slice(2, -2)} /></strong>)
    else if (m[3]) out.push(<em key={key++}>{s.slice(1, -1)}</em>)
    else {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(s)!
      out.push(
        href.startsWith('/')
          ? <Link key={key++} to={href}><InlineMd text={label} /></Link>
          : <a key={key++} href={href} target="_blank" rel="noreferrer">{label}</a>,
      )
    }
    last = m.index + s.length
  }
  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return <>{out}</>
}
