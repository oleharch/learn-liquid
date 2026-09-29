import { useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { LiveResult } from '@/lib/useLiquid'
import { InlineMd } from './InlineMd'

const FRAME_CSS = `body{font:15px/1.5 system-ui,sans-serif;margin:16px;color:#10222e;background:#fff}
img{max-width:100%;height:auto;background:#e8eef1;min-height:40px}table{border-collapse:collapse}td,th{border:1px solid #d9e1e7;padding:6px 10px}
a{color:#0b8a84}button,input,select{font:inherit}`

/** Пробіли й переноси стають видимими: без цього урок про whitespace — наосліп. */
const visible = (s: string) => s.replace(/ /g, '·').replace(/\t/g, '→   ').replace(/\n/g, '↵\n')

export function OutputPane({ result, view = 'text', full, extra }: { result: LiveResult; view?: 'text' | 'html'; full?: boolean; extra?: ReactNode }) {
  const [mode, setMode] = useState<'text' | 'html'>(view)
  const [ws, setWs] = useState(false)
  const looksHtml = /<[a-z][\s\S]*>/i.test(result.output)

  return (
    <>
      <header className="runner__bar runner__bar--out">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'text'} className="tabs__tab" onClick={() => setMode('text')}>Output</button>
          {(looksHtml || view === 'html' || full) && (
            <button role="tab" aria-selected={mode === 'html'} className="tabs__tab" onClick={() => setMode('html')}>Як сторінка</button>
          )}
        </div>
        <div className="runner__tools">
          {mode === 'text' && (
            <button className="iconbtn" aria-pressed={ws} onClick={() => setWs((v) => !v)} title="Показати пробіли й переноси">
              <span className="iconbtn__glyph">·↵</span>
            </button>
          )}
          {extra}
        </div>
      </header>

      {result.error ? (
        <div className="runner__error" role="alert">
          <AlertTriangle size={18} />
          <div>
            <p className="runner__error-msg"><InlineMd text={result.error.message} /></p>
            <p className="runner__error-raw">
              {result.error.line ? `рядок ${result.error.line}${result.error.col ? `, позиція ${result.error.col}` : ''} · ` : ''}
              {result.error.raw}
            </p>
          </div>
        </div>
      ) : mode === 'html' ? (
        <iframe className="runner__frame" title="Відрендерений HTML" sandbox=""
          srcDoc={`<!doctype html><meta charset="utf-8"><style>${FRAME_CSS}</style>${result.output}`} />
      ) : (
        <pre className={`runner__pre${ws ? ' runner__pre--ws' : ''}`}>
          {result.output === ''
            // Поки рушій рахує, «порожній вивід» — неправда: ще нічого не рахували.
            ? <span className="runner__empty">{result.pending ? '' : '— порожній output —'}</span>
            : ws ? visible(result.output) : result.output}
        </pre>
      )}
      {full && !result.error && <p className="runner__ms">{result.ms.toFixed(1)} мс</p>}
    </>
  )
}
