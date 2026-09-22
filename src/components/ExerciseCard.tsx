import { useState } from 'react'
import { Check, CircleCheck, Eye, Lightbulb, Play, X } from 'lucide-react'
import type { Exercise } from '@/content/types'
import { checkExercise, type CheckResult } from '@/engine/check'
import { progress, useProgress } from '@/lib/store'
import { InlineMd } from './InlineMd'
import { Runner } from './Runner'

export function ExerciseCard({ exercise: ex, index }: { exercise: Exercise; index: number }) {
  const p = useProgress()
  const solved = ex.id in p.solved
  const [code, setCode] = useState(p.drafts[ex.id] ?? p.solved[ex.id] ?? ex.starter)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [hints, setHints] = useState(0)
  const [showSolution, setShowSolution] = useState(false)

  const onChange = (v: string) => { setCode(v); setResult(null); progress.draft(ex.id, v) }

  const check = async () => {
    setChecking(true)
    const r = await checkExercise(ex, code)
    setResult(r)
    setChecking(false)
    if (r.passed) progress.solve(ex.id, code)
  }

  const failedOutput = result?.items.find((i) => !i.ok && i.want !== undefined)

  return (
    <article className={`exercise${solved ? ' exercise--solved' : ''}`} id={ex.id}>
      <header className="exercise__head">
        <span className="exercise__num">Завдання {index + 1}</span>
        <h3 className="exercise__title">{ex.title}</h3>
        {solved && <span className="exercise__done"><CircleCheck size={16} /> розвʼязано</span>}
      </header>
      <div className="exercise__task">
        {ex.task.map((t, i) => <p key={i}><InlineMd text={t} /></p>)}
      </div>

      <Runner
        example={{ template: ex.starter, data: ex.data, preset: ex.preset, snippets: ex.snippets, view: ex.view }}
        template={code}
        onTemplateChange={onChange}
        footer={
          <div className="exercise__actions">
            <button className="btn btn--primary" onClick={check} disabled={checking}><Play size={15} /> Перевірити</button>
            {hints < ex.hints.length && (
              <button className="btn" onClick={() => setHints((n) => n + 1)}><Lightbulb size={15} /> Підказка {hints + 1}/{ex.hints.length}</button>
            )}
            <button className="btn btn--ghost" onClick={() => setShowSolution((v) => !v)}><Eye size={15} /> {showSolution ? 'Сховати рішення' : 'Показати рішення'}</button>
          </div>
        }
      />

      {hints > 0 && (
        <ol className="exercise__hints">
          {ex.hints.slice(0, hints).map((h, i) => <li key={i}><InlineMd text={h} /></li>)}
        </ol>
      )}

      {result && (
        <div className={`verdict verdict--${result.passed ? 'ok' : 'bad'}`} role="status">
          <p className="verdict__head">{result.passed ? 'Усе сходиться.' : 'Ще не те — дивись, що не зійшлося:'}</p>
          <ul className="verdict__list">
            {result.items.map((it, i) => (
              <li key={i} className={it.ok ? 'is-ok' : 'is-bad'}>{it.ok ? <Check size={15} /> : <X size={15} />} <InlineMd text={it.label} /></li>
            ))}
          </ul>
          {failedOutput && (
            <div className="verdict__diff">
              <div><span>Твій вивід</span><pre>{failedOutput.got || '— порожньо —'}</pre></div>
              <div><span>Очікується</span><pre>{failedOutput.want || '— порожньо —'}</pre></div>
            </div>
          )}
          {result.passed && ex.explain && <p className="verdict__explain"><InlineMd text={ex.explain} /></p>}
        </div>
      )}

      {showSolution && (
        <div className="exercise__solution">
          <p className="exercise__solution-head">Еталонне рішення — одне з можливих</p>
          <pre>{ex.solution}</pre>
          <button className="btn btn--ghost" onClick={() => onChange(ex.solution)}>Підставити в редактор</button>
        </div>
      )}
    </article>
  )
}
