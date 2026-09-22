import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { TraceChain, TraceValue } from '@/engine/liquid'

/**
 * Ланцюжок фільтрів як труба, що йде згори вниз: значення входить першим
 * рядком і після кожного фільтра стає іншим. Головне, що тут видно, —
 * порядок зліва направо (у розмітці — згори вниз) і момент, коли значення
 * міняє ТИП: рядок стає масивом, масив — числом.
 */
function Value({ value, tone }: { value: TraceValue; tone?: 'start' | 'final' }) {
  const [open, setOpen] = useState(false)
  const cls = `tval tval--${value.kind}${tone ? ` tval--${tone}` : ''}`
  if (!value.full) return <span className={cls}>{value.label}</span>
  return (
    <span className={`${cls} tval--expandable`}>
      <button className="tval__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <ChevronRight size={13} className="tval__chev" aria-hidden />
        {value.label}
      </button>
      {open && <pre className="tval__full">{value.full}</pre>}
    </span>
  )
}

function Steps({ chain }: { chain: TraceChain }) {
  return (
    <ol className="tchain__steps">
      <li className="tstep tstep--start">
        <span className="tstep__label">вхід</span>
        <Value value={chain.initial} tone="start" />
      </li>
      {chain.steps.map((s, j) => (
        <li key={j} className="tstep">
          <span className="tstep__filter">| {s.source}</span>
          <Value value={s.output} tone={j === chain.steps.length - 1 ? 'final' : undefined} />
        </li>
      ))}
    </ol>
  )
}

/**
 * Той самий вираз усередині `{% for %}` виконується щоітерації, і десяток
 * однакових ланцюжків ховає решту шаблону. Тому однакові за текстом
 * згортаються в один запис із лічильником: перший прогін видно завжди,
 * решту — на вимогу (значення ж у них різні, і саме це цікаво).
 */
function Group({ runs }: { runs: TraceChain[] }) {
  const [open, setOpen] = useState(false)
  const first = runs[0]
  return (
    <section className="tchain">
      <header className="tchain__head">
        <span className="tchain__line">рядок {first.line}</span>
        <code className="tchain__src">{first.source}</code>
        {runs.length > 1 && (
          <button className="tchain__count" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? 'згорнути' : `виконано ${runs.length} рази — показати всі`}
          </button>
        )}
      </header>
      {open ? (
        runs.map((run, i) => (
          <div key={i} className="tchain__run">
            <p className="tchain__runlabel">прогін {i + 1}</p>
            <Steps chain={run} />
          </div>
        ))
      ) : (
        <Steps chain={first} />
      )}
    </section>
  )
}

export function TracePanel({ chains, pending }: { chains: TraceChain[]; pending?: boolean }) {
  const groups = useMemo(() => {
    const by = new Map<string, TraceChain[]>()
    for (const c of chains) {
      const key = `${c.line}::${c.source}`
      const list = by.get(key)
      if (list) list.push(c)
      else by.set(key, [c])
    }
    return [...by.values()]
  }, [chains])

  if (pending && chains.length === 0) return <div className="trace trace--empty">Рахую…</div>
  if (chains.length === 0) {
    return (
      <div className="trace trace--empty">
        У шаблоні ще немає фільтрів. Додай <code className="ic">| upcase</code> до будь-якого виводу — і тут зʼявиться, що відбувається на кожному кроці.
      </div>
    )
  }
  return (
    <div className="trace">
      {groups.map((runs, i) => <Group key={i} runs={runs} />)}
      {chains.length >= 60 && <p className="trace__more">Показано перші 60 ланцюжків — далі трасування вимкнено, щоб не гальмувати сторінку.</p>}
    </div>
  )
}
