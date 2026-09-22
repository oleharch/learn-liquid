import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CircleCheck, Clock } from 'lucide-react'
import { findLesson, interview, lessonPlan, lessons, modules } from '@/content'
import { Blocks } from '@/components/Blocks'
import { ExerciseCard } from '@/components/ExerciseCard'
import { InlineMd } from '@/components/InlineMd'
import { Quiz } from '@/components/Quiz'
import { progress, useProgress } from '@/lib/store'
import { ProgressBox } from '@/components/ProgressBox'

export function CourseMap() {
  const p = useProgress()
  const allExercises = lessons.flatMap((l) => l.exercises)
  return (
    <div className="page">
      <header className="page__head">
        <p className="eyebrow">Курс</p>
        <h1>Від першого <code className="ic">{'{{ }}'}</code> до секції зі схемою</h1>
        <p className="page__lead">У кожному уроці — теорія з живими прикладами, чотири завдання з автоперевіркою і короткий тест. Порядок має значення: кожен урок спирається на попередні.</p>
      </header>
      <ProgressBox solved={allExercises.filter((e) => e.id in p.solved).length} total={allExercises.length} />
      {modules.map((m) => (
        <section key={m.id} className="module">
          <header className="module__head">
            <span className="module__n">Модуль {m.id}</span>
            <h2>{m.title}</h2>
            <p>{m.summary}</p>
          </header>
          <ol className="module__list">
            {lessonPlan.filter((l) => l.module === m.id).map((plan) => {
              const l = findLesson(plan.id)
              const total = l?.exercises.length ?? 0
              const done = l ? l.exercises.filter((e) => e.id in p.solved).length : 0
              return (
                <li key={plan.id}>
                  {l ? (
                    <Link to={`/learn/${l.id}`} className="lessonrow">
                      <span className="lessonrow__n">{l.id.slice(1)}</span>
                      <span className="lessonrow__body">
                        <span className="lessonrow__title">{l.title}</span>
                        <span className="lessonrow__goal"><InlineMd text={l.goal} /></span>
                      </span>
                      <span className="lessonrow__meta">
                        {done === total && total > 0 ? <CircleCheck size={16} className="ok" /> : null}
                        {done}/{total} · <Clock size={13} /> {l.minutes} хв
                      </span>
                    </Link>
                  ) : (
                    <span className="lessonrow lessonrow--soon"><span className="lessonrow__n">{plan.id.slice(1)}</span><span className="lessonrow__body"><span className="lessonrow__title">{plan.title}</span><span className="lessonrow__goal">Урок ще пишеться</span></span></span>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}

export function LessonPage() {
  const { id = '' } = useParams()
  const lesson = findLesson(id)
  useEffect(() => { if (lesson) progress.visit(lesson.id) }, [lesson])
  if (!lesson) return <div className="page"><h1>Такого уроку немає</h1><Link to="/learn">До курсу</Link></div>

  const i = lessons.indexOf(lesson)
  const prev = lessons[i - 1]
  const next = lessons[i + 1]
  const related = interview.filter((q) => lesson.topics?.includes(q.topic)).length
  const mod = modules.find((m) => m.id === lesson.module)

  return (
    <article className="page page--lesson" key={lesson.id}>
      <header className="page__head">
        <p className="eyebrow">Модуль {lesson.module} · {mod?.title} · урок {lesson.id.slice(1)}</p>
        <h1>{lesson.title}</h1>
        <p className="page__lead"><InlineMd text={lesson.goal} /></p>
        <p className="page__meta"><Clock size={14} /> {lesson.minutes} хв · {lesson.exercises.length} завдання · {lesson.quiz.length} питання тесту</p>
      </header>

      <Blocks blocks={lesson.blocks} />

      <section className="stage">
        <h2 className="stage__title">Практика</h2>
        <p className="stage__lead">Рішення звіряється з еталоном за <strong>виводом</strong>, а не за текстом коду — форматуй як зручно. Частина завдань перевіряється ще й на прихованих даних, тож вписати готову відповідь не вийде.</p>
        {lesson.exercises.map((ex, n) => <ExerciseCard key={ex.id} exercise={ex} index={n} />)}
      </section>

      {lesson.quiz.length > 0 && (
        <section className="stage">
          <h2 className="stage__title">Перевір себе</h2>
          <Quiz questions={lesson.quiz} />
        </section>
      )}

      <footer className="lessonfoot">
        {(lesson.docs?.length || related > 0) && (
          <div className="lessonfoot__links">
            {lesson.docs?.map((d) => <Link key={d} to={`/docs/${d}`} className="chip">{d.split('/')[1]}</Link>)}
            {related > 0 && <Link to={`/interview?topics=${lesson.topics!.join(',')}`} className="chip chip--accent">{related} питань співбесіди з цієї теми</Link>}
          </div>
        )}
        <div className="pager">
          {prev ? <Link to={`/learn/${prev.id}`} className="pager__link"><ArrowLeft size={16} /> {prev.title}</Link> : <span />}
          {next ? <Link to={`/learn/${next.id}`} className="pager__link pager__link--next">{next.title} <ArrowRight size={16} /></Link> : <Link to="/interview" className="pager__link pager__link--next">До питань співбесіди <ArrowRight size={16} /></Link>}
        </div>
      </footer>
    </article>
  )
}
