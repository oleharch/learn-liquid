import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Plus, RotateCcw, Trash2, Waypoints } from 'lucide-react'
import type { Example, PresetId } from '@/content/types'
import { PRESET_LABELS, presetData } from '@/engine/presets'
import { encodeShare } from '@/lib/share'
import { useLiquid } from '@/lib/useLiquid'
import { CodeEditor } from './CodeEditor'
import { InlineMd } from './InlineMd'
import { OutputPane } from './OutputPane'
import { TracePanel } from './TracePanel'

type Tab = 'template' | 'data' | 'snippets'

interface Props {
  example: Example
  /** 'full' — пісочниця: вибір пресета, додавання сніпетів, висока панель. */
  variant?: 'inline' | 'full'
  /** Зовнішній контроль шаблону (завдання курсу зберігають чернетку). */
  template?: string
  onTemplateChange?: (value: string) => void
  onStateChange?: (state: { template: string; dataText: string; preset?: PresetId; snippets: Record<string, string> }) => void
  footer?: React.ReactNode
}

const pretty = (v: unknown) => JSON.stringify(v, null, 2)

export function Runner({ example, variant = 'inline', template: controlled, onTemplateChange, onStateChange, footer }: Props) {
  const full = variant === 'full'
  const [own, setOwn] = useState(example.template)
  const template = controlled ?? own
  const [dataText, setDataText] = useState(example.data ? pretty(example.data) : '')
  const [preset, setPreset] = useState<PresetId | undefined>(example.preset)
  const [snippets, setSnippets] = useState<Record<string, string>>(example.snippets ?? {})
  const [activeSnippet, setActiveSnippet] = useState<string | undefined>(Object.keys(example.snippets ?? {})[0])
  const [tab, setTab] = useState<Tab>('template')
  const [trace, setTrace] = useState(false)

  const result = useLiquid({ template, dataText, preset, snippets, trace })

  const emit = (next: Partial<{ template: string; dataText: string; preset?: PresetId; snippets: Record<string, string> }>) =>
    onStateChange?.({ template, dataText, preset, snippets, ...next })

  const setTemplate = (v: string) => { if (controlled === undefined) setOwn(v); onTemplateChange?.(v); emit({ template: v }) }

  const dirty = template !== example.template || dataText !== (example.data ? pretty(example.data) : '') || preset !== example.preset
    || JSON.stringify(snippets) !== JSON.stringify(example.snippets ?? {})

  const reset = () => {
    setTemplate(example.template)
    setDataText(example.data ? pretty(example.data) : '')
    setPreset(example.preset)
    setSnippets(example.snippets ?? {})
    setActiveSnippet(Object.keys(example.snippets ?? {})[0])
  }

  const presetJson = useMemo(() => (preset ? pretty(presetData(preset)) : ''), [preset])
  const hasData = full || !!example.data || !!preset
  const snippetNames = Object.keys(snippets)
  const hasSnippets = full || snippetNames.length > 0
  const chains = result.trace?.length ?? 0

  const addSnippet = () => {
    let n = 1
    while (snippets[`snippet-${n}`] !== undefined) n++
    const name = `snippet-${n}`
    const next = { ...snippets, [name]: '<p>{{ title }}</p>' }
    setSnippets(next); setActiveSnippet(name); emit({ snippets: next })
  }
  const renameSnippet = (from: string, to: string) => {
    const clean = to.trim().replace(/\.liquid$/, '')
    if (!clean || clean === from || snippets[clean] !== undefined) return
    const next = Object.fromEntries(Object.entries(snippets).map(([k, v]) => [k === from ? clean : k, v]))
    setSnippets(next); setActiveSnippet(clean); emit({ snippets: next })
  }
  const removeSnippet = (name: string) => {
    const { [name]: _gone, ...next } = snippets
    setSnippets(next); setActiveSnippet(Object.keys(next)[0]); emit({ snippets: next })
  }

  const shareHash = encodeShare({ t: template, d: dataText || undefined, p: preset, s: snippetNames.length ? snippets : undefined })

  return (
    <figure className={`runner runner--${variant}`}>
      {example.title && <figcaption className="runner__title">{example.title}</figcaption>}
      <div className="runner__grid">
        <section className="runner__in" aria-label="Input">
          <header className="runner__bar">
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'template'} className="tabs__tab" onClick={() => setTab('template')}>Input</button>
              {hasData && (
                <button role="tab" aria-selected={tab === 'data'} className="tabs__tab" onClick={() => setTab('data')}>
                  Дані{preset ? <span className="tabs__dot" aria-hidden /> : null}
                </button>
              )}
              {hasSnippets && (
                <button role="tab" aria-selected={tab === 'snippets'} className="tabs__tab" onClick={() => setTab('snippets')}>
                  Сніпети{snippetNames.length ? ` · ${snippetNames.length}` : ''}
                </button>
              )}
            </div>
            <div className="runner__tools">
              {dirty && (
                <button className="iconbtn" onClick={reset} title="Повернути початковий приклад">
                  <RotateCcw size={15} /> <span>Скинути</span>
                </button>
              )}
              {!full && (
                <Link className="iconbtn" to={`/playground#${shareHash}`} title="Відкрити в пісочниці">
                  <ExternalLink size={15} />
                </Link>
              )}
            </div>
          </header>

          {tab === 'template' && (
            <CodeEditor value={template} onChange={setTemplate} minHeight={full ? '340px' : '72px'} maxHeight={full ? '62vh' : '420px'} />
          )}

          {tab === 'data' && (
            <div className="runner__data">
              {full && (
                <label className="field">
                  <span className="field__label">Готові дані магазину</span>
                  <select value={preset ?? ''} onChange={(e) => { const p = (e.target.value || undefined) as PresetId | undefined; setPreset(p); emit({ preset: p }) }}>
                    <option value="">без пресета</option>
                    {(Object.keys(PRESET_LABELS) as PresetId[]).map((id) => <option key={id} value={id}>{PRESET_LABELS[id]}</option>)}
                  </select>
                </label>
              )}
              <p className="runner__hint">Ключі цього JSON стають змінними шаблону.{preset ? ' Вони накладаються поверх пресета.' : ''}</p>
              <CodeEditor lang="json" value={dataText} onChange={(v) => { setDataText(v); emit({ dataText: v }) }} minHeight="96px" maxHeight={full ? '40vh' : '300px'} />
              {result.dataError && <p className="runner__dataerr">JSON не розібрано: {result.dataError}</p>}
              {preset && (
                <details className="runner__preset">
                  <summary>Пресет «{PRESET_LABELS[preset]}» — що лежить у змінних</summary>
                  <CodeEditor lang="json" value={presetJson} readOnly maxHeight="320px" lineNumbers={false} />
                </details>
              )}
            </div>
          )}

          {tab === 'snippets' && (
            <div className="runner__data">
              <div className="chips">
                {snippetNames.map((name) => (
                  <button key={name} className="chip" aria-pressed={name === activeSnippet} onClick={() => setActiveSnippet(name)}>{name}.liquid</button>
                ))}
                {full && <button className="chip chip--add" onClick={addSnippet}><Plus size={14} /> сніпет</button>}
              </div>
              {activeSnippet !== undefined && snippets[activeSnippet] !== undefined ? (
                <>
                  {full && (
                    <div className="runner__sniprow">
                      <input key={activeSnippet} className="input" defaultValue={activeSnippet} aria-label="Імʼя сніпета"
                        onBlur={(e) => renameSnippet(activeSnippet, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} />
                      <button className="iconbtn" onClick={() => removeSnippet(activeSnippet)} title="Видалити сніпет"><Trash2 size={15} /></button>
                    </div>
                  )}
                  <p className="runner__hint">Викликається як <code className="ic">{`{% render '${activeSnippet}' %}`}</code></p>
                  <CodeEditor value={snippets[activeSnippet]} minHeight="96px" maxHeight={full ? '46vh' : '300px'}
                    onChange={(v) => { const next = { ...snippets, [activeSnippet]: v }; setSnippets(next); emit({ snippets: next }) }} />
                </>
              ) : (
                <p className="runner__hint">Сніпетів ще немає. Додай перший і виклич його через <code className="ic">{`{% render %}`}</code>.</p>
              )}
            </div>
          )}
        </section>

        <div className="runner__pipe" aria-hidden><span /></div>

        <section className="runner__out" aria-label="Output" aria-live="polite">
          <OutputPane result={result} view={example.view} full={full}
            extra={
              <button className="iconbtn" aria-pressed={trace} onClick={() => setTrace((v) => !v)} title="Показати проміжні значення кожного фільтра">
                <Waypoints size={15} /> <span className="iconbtn__label">Кроки фільтрів{trace && chains ? ` · ${chains}` : ''}</span>
              </button>
            } />
        </section>
      </div>

      {trace && <TracePanel chains={result.trace ?? []} pending={result.pending} />}

      {example.shopifyOutput !== undefined && (
        <div className="runner__shopify">
          <span className="runner__shopify-label">У Shopify</span>
          <pre>{example.shopifyOutput}</pre>
          <Link to="/docs/basics/sandbox">чому інакше?</Link>
        </div>
      )}
      {example.note && <p className="runner__note"><InlineMd text={example.note} /></p>}
      {footer}
    </figure>
  )
}
