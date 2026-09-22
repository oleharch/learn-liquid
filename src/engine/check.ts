import type { Exercise, QuizQuestion } from '@/content/types'
import { renderLiquid } from './liquid'

/** Будь-яка послідовність пробільних символів = один пробіл. */
export const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()

export interface CheckItem {
  ok: boolean
  label: string
  /** Що вийшло і що очікувалось — лише для перевірок виводу. */
  got?: string
  want?: string
}

export interface CheckResult {
  passed: boolean
  items: CheckItem[]
}

const same = (a: string, b: string, strict?: boolean) => (strict ? a === b : normalize(a) === normalize(b))

/**
 * Рішення звіряється не з записаним рядком, а з ВИВОДОМ ЕТАЛОНА на тих самих
 * даних — і ще раз на прихованому наборі, де захардкоджена відповідь падає.
 */
export async function checkExercise(ex: Exercise, source: string): Promise<CheckResult> {
  const items: CheckItem[] = []
  const base = { preset: ex.preset, snippets: ex.snippets }

  const runs: { label: string; data?: Record<string, unknown> }[] = [{ label: 'Вивід збігається з очікуваним', data: ex.data }]
  if (ex.altData) runs.push({ label: 'Працює й на інших даних (прихована перевірка)', data: ex.altData })

  for (const run of runs) {
    const [mine, ref] = await Promise.all([
      renderLiquid({ ...base, template: source, data: run.data }),
      renderLiquid({ ...base, template: ex.solution, data: run.data }),
    ])
    if (mine.error) {
      items.push({ ok: false, label: `${run.label}: ${mine.error.message}` })
      continue
    }
    items.push({ ok: same(mine.output, ref.output, ex.strictWhitespace), label: run.label, got: mine.output, want: ref.output })
  }

  for (const rule of ex.mustUse ?? []) {
    items.push({ ok: new RegExp(rule.pattern, 's').test(source), label: rule.label })
  }
  for (const rule of ex.mustNotUse ?? []) {
    items.push({ ok: !new RegExp(rule.pattern, 's').test(source), label: rule.label })
  }

  return { passed: items.every((i) => i.ok), items }
}

/** Для тестів «що виведе цей код?»: правильний варіант мусить збігатися з рушієм. */
export async function quizAnswerMatches(q: QuizQuestion): Promise<{ ok: boolean; output: string }> {
  if (!q.template) return { ok: true, output: '' }
  const r = await renderLiquid({ template: q.template, data: q.data, preset: q.preset })
  const want = q.options[q.correct] ?? ''
  if (r.error) return { ok: /помилк|error/i.test(want), output: `ПОМИЛКА: ${r.error.raw}` }
  return { ok: normalize(r.output) === normalize(want), output: r.output }
}
