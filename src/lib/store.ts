import { useSyncExternalStore } from 'react'

/**
 * Прогрес живе в localStorage цього браузера — сервера в сайту немає.
 * Один ключ, один JSON: так його легко експортувати й перенести.
 */

export type Grade = 'know' | 'partial' | 'dont'

export interface Progress {
  /** Розвʼязані завдання: id → код, яким розвʼязано. */
  solved: Record<string, string>
  /** Чернетки завдань, щоб код не зникав при переході між сторінками. */
  drafts: Record<string, string>
  /** Тести: id питання → обраний варіант. */
  quiz: Record<string, number>
  /** Картки співбесіди: id → самооцінка й час. */
  cards: Record<string, { grade: Grade; at: number }>
  /** Останній відкритий урок. */
  lastLesson?: string
}

const KEY = 'll:progress:v1'
const empty: Progress = { solved: {}, drafts: {}, quiz: {}, cards: {} }

let state: Progress = load()
const listeners = new Set<() => void>()

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...(JSON.parse(raw) as Partial<Progress>) } : empty
  } catch {
    return empty
  }
}

function commit(next: Progress) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* приватне вікно: працюємо в памʼяті */ }
  listeners.forEach((l) => l())
}

export const progress = {
  get: () => state,
  solve: (id: string, code: string) => commit({ ...state, solved: { ...state.solved, [id]: code } }),
  draft: (id: string, code: string) => commit({ ...state, drafts: { ...state.drafts, [id]: code } }),
  answer: (id: string, option: number) => commit({ ...state, quiz: { ...state.quiz, [id]: option } }),
  grade: (id: string, grade: Grade) => commit({ ...state, cards: { ...state.cards, [id]: { grade, at: Date.now() } } }),
  visit: (lessonId: string) => { if (state.lastLesson !== lessonId) commit({ ...state, lastLesson: lessonId }) },
  reset: () => commit(empty),
  export: () => JSON.stringify(state, null, 2),
  import: (json: string) => commit({ ...empty, ...(JSON.parse(json) as Partial<Progress>) }),
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => state,
  )
}

/* ───────── тема ───────── */

export type Theme = 'light' | 'dark'
const themeListeners = new Set<() => void>()

const systemTheme = (): Theme => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
const currentTheme = (): Theme => (document.documentElement.dataset.theme as Theme | undefined) ?? systemTheme()

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try { localStorage.setItem('ll:theme', theme) } catch { /* без збереження */ }
  themeListeners.forEach((l) => l())
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      themeListeners.add(cb)
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', cb)
      return () => { themeListeners.delete(cb); mq.removeEventListener('change', cb) }
    },
    currentTheme,
  )
}
