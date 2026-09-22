import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { docs, interview, lessons } from '@/content'
import { Runner } from '@/components/Runner'
import { useProgress } from '@/lib/store'

const HERO = `{% assign hits = collection.products | where: 'available' %}
<h2>{{ collection.title | upcase }}</h2>

{% for product in hits limit: 3 %}
  {{ forloop.index }}. {{ product.title | truncate: 24 }} — {{ product.price | money }}
{% else %}
  Поки порожньо
{% endfor %}`

export function Home() {
  const p = useProgress()
  const exercises = lessons.flatMap((l) => l.exercises)
  const solved = exercises.filter((e) => e.id in p.solved).length
  const known = interview.filter((q) => p.cards[q.id]?.grade === 'know').length
  const next = lessons.find((l) => l.exercises.some((e) => !(e.id in p.solved))) ?? lessons[0]
  const resume = (p.lastLesson && lessons.find((l) => l.id === p.lastLesson)) || next

  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">Тренажер Liquid для Shopify-розробника</p>
        <h1 className="hero__title">Зміни шаблон —<br />вивід зміниться одразу</h1>
        <p className="hero__lead">
          Це робочий Liquid, а не картинка. Прибери <code className="ic">where</code>, постав <code className="ic">limit: 1</code>,
          увімкни «Кроки фільтрів» — і подивись, як значення йде крізь ланцюжок.
        </p>
        <Runner example={{ template: HERO, preset: 'collection' }} />
      </section>

      <section className="paths">
        <Link to={resume ? `/learn/${resume.id}` : '/learn'} className="path path--main">
          <span className="path__kicker">{solved ? 'Продовжити' : 'Почати з нуля'}</span>
          <span className="path__title">{resume ? `Урок ${resume.id.slice(1)}. ${resume.title}` : 'Курс'}</span>
          <span className="path__meta">{solved} із {exercises.length} завдань розвʼязано <ArrowRight size={16} /></span>
          <span className="path__bar"><i style={{ width: `${exercises.length ? (solved / exercises.length) * 100 : 0}%` }} /></span>
        </Link>
        <Link to="/interview" className="path">
          <span className="path__kicker">Співбесіда</span>
          <span className="path__title">{interview.length} питань з усними відповідями</span>
          <span className="path__meta">{known} уже знаю <ArrowRight size={16} /></span>
        </Link>
        <Link to="/docs" className="path">
          <span className="path__kicker">Довідник</span>
          <span className="path__title">{docs.length} сторінок, кожен приклад — живий</span>
          <span className="path__meta">теги, фільтри, Shopify <ArrowRight size={16} /></span>
        </Link>
        <Link to="/playground" className="path">
          <span className="path__kicker">Пісочниця</span>
          <span className="path__title">Шаблон, JSON-дані, сніпети</span>
          <span className="path__meta">із даними магазину <ArrowRight size={16} /></span>
        </Link>
      </section>
    </div>
  )
}
