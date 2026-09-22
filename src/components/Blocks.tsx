import { AlertTriangle, Info, Lightbulb, MessagesSquare, Store } from 'lucide-react'
import type { Block, NoteTone } from '@/content/types'
import { InlineMd } from './InlineMd'
import { Runner } from './Runner'
import { StaticCode } from './StaticCode'

const NOTE: Record<NoteTone, { icon: typeof Info; label: string }> = {
  info: { icon: Info, label: 'Довідка' },
  warn: { icon: AlertTriangle, label: 'Пастка' },
  tip: { icon: Lightbulb, label: 'Порада' },
  shopify: { icon: Store, label: 'У Shopify' },
  interview: { icon: MessagesSquare, label: 'На співбесіді' },
}

export const slugify = (s: string) => s.toLowerCase().replace(/[`'ʼ"]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'p':
            return <p key={i}><InlineMd text={b.text} /></p>
          case 'h':
            return <h2 key={i} id={b.id ?? slugify(b.text)}><InlineMd text={b.text} /></h2>
          case 'list': {
            const Tag = b.ordered ? 'ol' : 'ul'
            return <Tag key={i}>{b.items.map((t, j) => <li key={j}><InlineMd text={t} /></li>)}</Tag>
          }
          case 'note': {
            const { icon: Icon, label } = NOTE[b.tone]
            return (
              <aside key={i} className={`note note--${b.tone}`}>
                <p className="note__head"><Icon size={16} aria-hidden /> {b.title ?? label}</p>
                <p className="note__text"><InlineMd text={b.text} /></p>
              </aside>
            )
          }
          case 'example':
            // key з шаблону: при переході між сторінками Runner має скинути свій стан.
            return <Runner key={`${i}:${b.template}`} example={b} />
          case 'code':
            return <StaticCode key={i} code={b.code} lang={b.lang} title={b.title} />
          case 'table':
            return (
              <div key={i} className="tablewrap">
                <table>
                  <thead><tr>{b.head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
                  <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}><InlineMd text={c} /></td>)}</tr>)}</tbody>
                </table>
              </div>
            )
        }
      })}
    </div>
  )
}

export const headingsOf = (blocks: Block[]) =>
  blocks.filter((b): b is Extract<Block, { type: 'h' }> => b.type === 'h').map((b) => ({ id: b.id ?? slugify(b.text), text: b.text.replace(/`/g, '') }))
