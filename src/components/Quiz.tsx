import type { QuizQuestion } from '@/content/types'
import { progress, useProgress } from '@/lib/store'
import { InlineMd } from './InlineMd'
import { StaticCode } from './StaticCode'

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const p = useProgress()
  return (
    <div className="quiz">
      {questions.map((q, i) => {
        const chosen = p.quiz[q.id]
        const answered = chosen !== undefined
        return (
          <fieldset key={q.id} className="quiz__q">
            <legend><span className="quiz__n">{i + 1}</span> <InlineMd text={q.q} /></legend>
            {q.template && <StaticCode code={q.template} />}
            {q.data && <StaticCode lang="json" title="Дані" code={JSON.stringify(q.data, null, 2)} />}
            <div className="quiz__opts">
              {q.options.map((opt, j) => {
                const state = !answered ? '' : j === q.correct ? ' is-correct' : j === chosen ? ' is-wrong' : ' is-dim'
                return (
                  <button key={j} className={`quiz__opt${state}`} disabled={answered} onClick={() => progress.answer(q.id, j)}>
                    <pre>{opt === '' ? '(нічого не виведе)' : opt}</pre>
                  </button>
                )
              })}
            </div>
            {answered && (
              <p className={`quiz__explain${chosen === q.correct ? ' is-ok' : ''}`}>
                <strong>{chosen === q.correct ? 'Так.' : 'Ні.'}</strong> <InlineMd text={q.explain} />
              </p>
            )}
          </fieldset>
        )
      })}
    </div>
  )
}
