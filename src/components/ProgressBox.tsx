import { useRef, useState } from 'react'
import { Download, RotateCcw, Upload } from 'lucide-react'
import { progress, useProgress } from '@/lib/store'

/**
 * Прогрес живе лише в цьому браузері — сервера в сайту немає. Тому людині
 * потрібен спосіб забрати його з собою (інший компʼютер, чищення кешу)
 * і спосіб почати спочатку.
 */
export function ProgressBox({ solved, total }: { solved: number; total: number }) {
  const p = useProgress()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const say = (text: string) => { setMsg(text); setTimeout(() => setMsg(null), 3000) }

  const save = () => {
    const blob = new Blob([progress.export()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `liquid-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    say('Файл збережено')
  }

  const load = async (f: File) => {
    try {
      progress.import(await f.text())
      say('Прогрес відновлено')
    } catch {
      say('Не вдалося прочитати файл — це має бути експорт із цього ж сайту')
    }
  }

  const answered = Object.keys(p.quiz).length
  const graded = Object.keys(p.cards).length

  return (
    <aside className="pbox">
      <div className="pbox__stats">
        <p className="pbox__title">Твій прогрес</p>
        <p className="pbox__nums">
          <b>{solved}</b> із {total} завдань · <b>{answered}</b> відповідей у тестах · <b>{graded}</b> оцінених питань
        </p>
        <p className="pbox__note">Зберігається лише в цьому браузері. Почистиш дані сайту — зникне.</p>
      </div>
      <div className="pbox__actions">
        <button className="btn btn--ghost" onClick={save}><Download size={15} /> Зберегти у файл</button>
        <button className="btn btn--ghost" onClick={() => file.current?.click()}><Upload size={15} /> Відновити з файлу</button>
        <button
          className="btn btn--ghost"
          onClick={() => { if (confirm('Скинути весь прогрес? Розвʼязані завдання, відповіді тестів і оцінки питань буде стерто.')) { progress.reset(); say('Прогрес скинуто') } }}
        >
          <RotateCcw size={15} /> Почати спочатку
        </button>
        <input
          ref={file} type="file" accept="application/json" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void load(f); e.target.value = '' }}
        />
      </div>
      {msg && <p className="pbox__msg" role="status">{msg}</p>}
    </aside>
  )
}
