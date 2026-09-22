import { useEffect, useRef, useState } from 'react'
import { renderLiquid, type RenderInput, type RenderResult } from '@/engine/liquid'

export interface LiveInput extends Omit<RenderInput, 'data'> {
  /** JSON як текст: поки він невалідний, рендер не запускається, а помилка показується. */
  dataText?: string
}

export interface LiveResult extends RenderResult {
  dataError?: string
  pending: boolean
}

/** Рендерить шаблон із затримкою, щоб не смикати рушій на кожну літеру. */
export function useLiquid(input: LiveInput, delay = 160): LiveResult {
  const [result, setResult] = useState<LiveResult>({ output: '', ms: 0, pending: true })
  const seq = useRef(0)
  const { template, dataText, preset, snippets, trace } = input
  const snippetsKey = JSON.stringify(snippets ?? {})

  useEffect(() => {
    const id = ++seq.current
    const timer = setTimeout(async () => {
      let data: Record<string, unknown> | undefined
      if (dataText?.trim()) {
        try {
          const parsed: unknown = JSON.parse(dataText)
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('дані мають бути обʼєктом { … }: його ключі стають змінними шаблону')
          data = parsed as Record<string, unknown>
        } catch (e) {
          if (id === seq.current) setResult((r) => ({ ...r, dataError: (e as Error).message, pending: false }))
          return
        }
      }
      const r = await renderLiquid({ template, data, preset, snippets, trace })
      if (id === seq.current) setResult({ ...r, pending: false })
    }, delay)
    return () => clearTimeout(timer)
    // snippetsKey замість snippets: обʼєкт новий на кожен рендер, вміст — ні.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, dataText, preset, snippetsKey, trace, delay])

  return result
}
