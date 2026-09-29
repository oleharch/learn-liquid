import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronDown, Eye, GraduationCap, Shuffle, Target, Timer } from 'lucide-react'
import { findLesson, interview, lessonsForTopic, resolveRef, SECTION_LABELS } from '@/content'
import type { InterviewLevel, InterviewQA, InterviewTopic } from '@/content/types'
import { Blocks } from '@/components/Blocks'
import { InlineMd } from '@/components/InlineMd'
import { progress, useProgress, type Grade, type Progress } from '@/lib/store'

const TOPICS: Record<InterviewTopic, string> = {
  basics: 'Основи', types: 'Типи', operators: 'Оператори', variables: 'Змінні', 'control-flow': 'Умови', iteration: 'Цикли',
  filters: 'Фільтри', whitespace: 'Whitespace', snippets: 'Сніпети', objects: 'Обʼєкти Shopify', architecture: 'Архітектура теми',
  sections: 'Секції і схема', performance: 'Performance', security: 'Безпека', debugging: 'Debugging', practical: 'Практичні задачі',
}
const LEVELS: Record<InterviewLevel, string> = { junior: 'Junior', middle: 'Middle', senior: 'Senior' }
const GRADES: { id: Grade; label: string }[] = [
  { id: 'dont', label: 'Не знаю' },
  { id: 'partial', label: 'Частково' },
  { id: 'know', label: 'Знаю' },
]

function GradeButtons({ id, onGrade }: { id: string; onGrade?: () => void }) {
  const current = useProgress().cards[id]?.grade
  return (
    <div className="grades" role="group" aria-label="Наскільки добре знаєш відповідь">
      {GRADES.map((g) => (
        <button key={g.id} className={`grade grade--${g.id}`} aria-pressed={current === g.id} onClick={() => { progress.grade(id, g.id); onGrade?.() }}>{g.label}</button>
      ))}
    </div>
  )
}

function Answer({ qa }: { qa: InterviewQA }) {
  return (
    <div className="answer">
      <div className="answer__short">
        <p className="answer__label">Відповідь уголос · 20–40 секунд</p>
        <p><InlineMd text={qa.short} /></p>
      </div>
      <Blocks blocks={qa.blocks} />
      {!!qa.followUps?.length && (
        <div className="answer__follow">
          <p className="answer__label">Що спитають далі — розгорни, щоб звірити відповідь</p>
          <div className="follow">
            {qa.followUps.map((f, i) => (
              <details key={i} className="follow__item">
                <summary><span><InlineMd text={f.q} /></span></summary>
                <div className="follow__body">
                  <p><InlineMd text={f.a} /></p>
                  {f.to && <FollowLink to={f.to} />}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
      <AnswerLessons topic={qa.topic} />
    </div>
  )
}

/** Підпис для посилання «довчити»: назва сторінки довідника, уроку чи питання. */
function FollowLink({ to }: { to: string }) {
  const doc = to.startsWith('/docs/') ? resolveRef(to.slice('/docs/'.length)) : undefined
  const lesson = to.startsWith('/learn/') ? findLesson(to.slice('/learn/'.length)) : undefined
  const qid = /^\/interview\?q=([\w-]+)$/.exec(to)?.[1]
  const other = qid ? interview.find((x) => x.id === qid) : undefined
  return (
    <Link to={to} className="chip chip--titled">
      {doc ? <><span className="chip__k">{SECTION_LABELS[doc.section]}</span> {doc.title}</>
        : lesson ? <><GraduationCap size={13} aria-hidden /> <span className="chip__k">Урок {lesson.id.slice(1)}</span> {lesson.title}</>
        : other ? <><span className="chip__k">Питання</span> <InlineMd text={other.q} /></>
        : 'Докладніше'}
      <ArrowRight size={13} aria-hidden />
    </Link>
  )
}

/** Куди йти, щоб довчити тему: уроки курсу, що її закривають. */
function AnswerLessons({ topic }: { topic: InterviewTopic }) {
  const list = lessonsForTopic(topic)
  if (!list.length) return null
  return (
    <div className="answer__lessons">
      <p className="answer__label">Довчити в курсі</p>
      <div className="lessonfoot__links">
        {list.map((l) => (
          <Link key={l.id} to={`/learn/${l.id}`} className="chip chip--titled"><GraduationCap size={13} aria-hidden /> <span className="chip__k">Урок {l.id.slice(1)}</span> {l.title}</Link>
        ))}
      </div>
    </div>
  )
}

/** Спершу те, що не знаю, потім нове, потім «частково»; знане — давнє вперед. */
function byWeakness(p: Progress) {
  const rank = (q: InterviewQA) => { const g = p.cards[q.id]?.grade; return g === 'dont' ? 0 : g === undefined ? 1 : g === 'partial' ? 2 : 3 }
  return (a: InterviewQA, b: InterviewQA) => rank(a) - rank(b) || (p.cards[a.id]?.at ?? 0) - (p.cards[b.id]?.at ?? 0)
}

function Trainer({ pool, mock, onExit }: { pool: InterviewQA[]; mock: boolean; onExit: () => void }) {
  const p = useProgress()
  const [queue] = useState(() => (mock ? [...pool].sort(() => Math.random() - 0.5).slice(0, 10) : [...pool].sort(byWeakness(p))))
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const qa = queue[i]

  useEffect(() => {
    setSeconds(0)
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [i])

  if (!qa) {
    const count = (g: Grade) => queue.filter((q) => p.cards[q.id]?.grade === g).length
    return (
      <div className="trainer trainer--done">
        <h2>{mock ? 'Співбесіду завершено' : 'Коло пройдено'}</h2>
        <p className="trainer__sum"><b>{count('know')}</b> знаю · <b>{count('partial')}</b> частково · <b>{count('dont')}</b> не знаю — із {queue.length}</p>
        <p className="muted">Питання з «не знаю» й «частково» наступного разу підуть першими.</p>
        <button className="btn btn--primary" onClick={onExit}>До банку питань</button>
      </div>
    )
  }

  const mm = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  return (
    <div className="trainer">
      <header className="trainer__bar">
        <span>{i + 1} / {queue.length}</span>
        <span className="flag">{TOPICS[qa.topic]}</span>
        <span className={`flag flag--${qa.level}`}>{LEVELS[qa.level]}</span>
        <span className={`trainer__time${seconds > 120 ? ' is-over' : ''}`}><Timer size={14} /> {mm}</span>
        <button className="btn btn--ghost" onClick={onExit}>Вийти</button>
      </header>
      <h2 className="trainer__q"><InlineMd text={qa.q} /></h2>
      {!shown ? (
        <div className="trainer__think">
          <p className="muted">Спершу відповідай уголос — так, як відповідав би інтервʼюеру. Потім звір.</p>
          <button className="btn btn--primary" onClick={() => setShown(true)}><Eye size={15} /> Показати відповідь</button>
        </div>
      ) : (
        <>
          <Answer qa={qa} />
          <div className="trainer__grade">
            <p className="answer__label">Як відповів?</p>
            <GradeButtons id={qa.id} onGrade={() => { setShown(false); setI((n) => n + 1); window.scrollTo(0, 0) }} />
          </div>
        </>
      )}
    </div>
  )
}

export function Interview() {
  const p = useProgress()
  const [params, setParams] = useSearchParams()
  const [mode, setMode] = useState<'bank' | 'train' | 'mock'>('bank')
  const [open, setOpen] = useState<string | null>(params.get('q'))
  const [text, setText] = useState('')
  const topics = useMemo(() => new Set((params.get('topics') ?? '').split(',').filter(Boolean) as InterviewTopic[]), [params])
  const level = (params.get('level') ?? '') as InterviewLevel | ''
  const status = params.get('status') ?? ''

  useEffect(() => {
    const id = params.get('q')
    if (id) { setOpen(id); requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' })) }
  }, [params])

  // Акордеон: коли одне питання згортається, а інше розгортається, сторінка
  // зсувається на висоту згорнутої відповіді — і клікнутий рядок їде за екран.
  // Тому запамʼятовуємо, де рядок був на екрані до кліку, і після перемальовки
  // повертаємо його на те саме місце.
  const anchor = useRef<{ id: string; top: number } | null>(null)
  const toggle = (id: string) => {
    anchor.current = { id, top: document.getElementById(id)?.getBoundingClientRect().top ?? 0 }
    setOpen((cur) => (cur === id ? null : id))
  }
  useLayoutEffect(() => {
    const a = anchor.current
    if (!a) return
    anchor.current = null
    const el = document.getElementById(a.id)
    if (el) window.scrollBy({ top: el.getBoundingClientRect().top - a.top, behavior: 'instant' })
  }, [open])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('q')
    setParams(next, { replace: true })
  }
  const toggleTopic = (t: InterviewTopic) => {
    const next = new Set(topics)
    if (next.has(t)) next.delete(t); else next.add(t)
    update('topics', [...next].join(','))
  }

  const pool = interview.filter((q) => {
    const g = p.cards[q.id]?.grade
    return (!topics.size || topics.has(q.topic)) && (!level || q.level === level)
      && (!status || (status === 'new' ? !g : g === status))
      && (!text || q.q.toLowerCase().includes(text.toLowerCase()))
  })

  const usedTopics = (Object.keys(TOPICS) as InterviewTopic[]).filter((t) => interview.some((q) => q.topic === t))
  const known = interview.filter((q) => p.cards[q.id]?.grade === 'know').length

  if (mode !== 'bank') return <div className="page"><Trainer pool={pool.length ? pool : interview} mock={mode === 'mock'} onExit={() => setMode('bank')} /></div>

  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">Співбесіда</p>
        <h1>Питання, на які треба відповісти вголос</h1>
        <p className="page__lead">У кожного питання — коротка усна відповідь на пів хвилини й розбір із прикладами. Оцінюй себе чесно: тренування спершу підсовує те, що знаєш найгірше.</p>
        <div className="meter" aria-label={`Знаю ${known} із ${interview.length}`}><i style={{ width: `${interview.length ? (known / interview.length) * 100 : 0}%` }} /></div>
        <p className="page__meta">{known} із {interview.length} — «знаю»</p>
      </header>

      <div className="trainbar">
        <button className="btn btn--primary" onClick={() => setMode('train')} disabled={!interview.length}><Target size={15} /> Тренувати слабкі місця{pool.length !== interview.length ? ` · ${pool.length}` : ''}</button>
        <button className="btn" onClick={() => setMode('mock')} disabled={!interview.length}><Shuffle size={15} /> Пробна співбесіда: 10 питань</button>
      </div>

      <div className="filters">
        <div className="chips">
          {usedTopics.map((t) => <button key={t} className="chip" aria-pressed={topics.has(t)} onClick={() => toggleTopic(t)}>{TOPICS[t]} <span className="count">{interview.filter((q) => q.topic === t).length}</span></button>)}
        </div>
        <div className="filters__row">
          <select value={level} onChange={(e) => update('level', e.target.value)} aria-label="Рівень">
            <option value="">усі рівні</option>
            {(Object.keys(LEVELS) as InterviewLevel[]).map((l) => <option key={l} value={l}>{LEVELS[l]}</option>)}
          </select>
          <select value={status} onChange={(e) => update('status', e.target.value)} aria-label="Стан">
            <option value="">будь-який стан</option>
            <option value="new">ще не відповідав</option>
            <option value="dont">не знаю</option>
            <option value="partial">частково</option>
            <option value="know">знаю</option>
          </select>
          <input className="input" placeholder="Слово з питання" value={text} onChange={(e) => setText(e.target.value)} aria-label="Пошук у питаннях" />
        </div>
      </div>

      {!interview.length && <p className="muted">Банк питань ще пишеться.</p>}
      {!!interview.length && pool.length === 0 && <p className="muted">За цими фільтрами питань немає.</p>}

      <ol className="qalist">
        {pool.map((qa) => {
          const isOpen = open === qa.id
          const g = p.cards[qa.id]?.grade
          return (
            <li key={qa.id} id={qa.id} className={`qa${isOpen ? ' qa--open' : ''}`}>
              <button className="qa__row" onClick={() => toggle(qa.id)} aria-expanded={isOpen}>
                <span className={`qa__dot qa__dot--${g ?? 'new'}`} aria-label={g ? GRADES.find((x) => x.id === g)!.label : 'ще не відповідав'} />
                <span className="qa__q"><InlineMd text={qa.q} /></span>
                <span className="qa__tags"><span className="flag">{TOPICS[qa.topic]}</span><span className={`flag flag--${qa.level}`}>{LEVELS[qa.level]}</span></span>
                <ChevronDown size={18} className="qa__chev" />
              </button>
              {isOpen && (
                <div className="qa__body">
                  <Answer qa={qa} />
                  <GradeButtons id={qa.id} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
