import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, Braces, CircleCheck, FlaskConical, GraduationCap, Menu, MessagesSquare, Moon, Search as SearchIcon, Store, Sun, TableProperties, X } from 'lucide-react'
import { docsBySection, lessons, modules, SECTION_LABELS } from '@/content'
import type { DocSection, FilterCategory } from '@/content/types'
import { setTheme, useProgress, useTheme } from '@/lib/store'
import { Search } from './Search'

const PRIMARY = [
  { to: '/learn', label: 'Курс', icon: GraduationCap },
  { to: '/docs', label: 'Довідник', icon: BookOpen },
  { to: '/shopify', label: 'Shopify', icon: Store },
  { to: '/playground', label: 'Пісочниця', icon: FlaskConical },
  { to: '/interview', label: 'Співбесіда', icon: MessagesSquare },
  { to: '/cheatsheet', label: 'Шпаргалка', icon: TableProperties },
]

const CATEGORY_LABELS: Record<FilterCategory, string> = { string: 'String', math: 'Числа', array: 'Масиви', date: 'Дати', other: 'Інше' }

function CourseNav() {
  const p = useProgress()
  return (
    <>
      {modules.map((m) => {
        const list = lessons.filter((l) => l.module === m.id)
        if (!list.length) return null
        return (
          <div key={m.id} className="side__group">
            <p className="side__kicker">Модуль {m.id} · {m.title}</p>
            {list.map((l) => {
              const done = l.exercises.length > 0 && l.exercises.every((e) => e.id in p.solved)
              return (
                <NavLink key={l.id} to={`/learn/${l.id}`} className="side__link">
                  <span className="side__num">{l.id.slice(1)}</span>
                  <span className="side__text">{l.title}</span>
                  {done && <CircleCheck size={14} className="side__done" aria-label="пройдено" />}
                </NavLink>
              )
            })}
          </div>
        )
      })}
    </>
  )
}

function DocsNav({ sections }: { sections: DocSection[] }) {
  return (
    <>
      {sections.map((s) => {
        const pages = docsBySection(s)
        if (!pages.length) return null
        if (s !== 'filters') {
          return (
            <div key={s} className="side__group">
              <p className="side__kicker">{SECTION_LABELS[s]}</p>
              {pages.map((d) => <NavLink key={d.slug} to={`/docs/${s}/${d.slug}`} className="side__link"><span className="side__text">{d.title}</span></NavLink>)}
              {s === 'shopify' && <NavLink to="/shopify/reference" className="side__link side__link--accent"><span className="side__text">Повний індекс: 154 фільтри, 142 обʼєкти</span></NavLink>}
            </div>
          )
        }
        return (Object.keys(CATEGORY_LABELS) as FilterCategory[]).map((cat) => {
          const inCat = pages.filter((d) => (d.category ?? 'other') === cat)
          if (!inCat.length) return null
          return (
            <div key={cat} className="side__group">
              <p className="side__kicker">Фільтри · {CATEGORY_LABELS[cat]}</p>
              <div className="side__cloud">
                {inCat.map((d) => <NavLink key={d.slug} to={`/docs/filters/${d.slug}`} className="side__pill">{d.slug}</NavLink>)}
              </div>
            </div>
          )
        })
      })}
    </>
  )
}

export function Shell() {
  const { pathname } = useLocation()
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    // Перехід на іншу сторінку — нагору; якір у межах сторінки лишається браузеру.
    if (!window.location.hash || pathname === '/playground') window.scrollTo(0, 0)
  }, [pathname])

  const inShopify = pathname.startsWith('/shopify') || pathname.startsWith('/docs/shopify')
  const context = pathname.startsWith('/learn') ? 'course' : inShopify ? 'shopify' : pathname.startsWith('/docs') || pathname === '/cheatsheet' ? 'docs' : null

  return (
    <div className="app">
      <header className="topbar">
        <button className="iconbtn topbar__menu" onClick={() => setOpen((v) => !v)} aria-label="Меню" aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        <NavLink to="/" className="brand" aria-label="Liquid від А до Я — на головну">
          <Braces size={20} aria-hidden />
          <span className="brand__name">Liquid <em>від А до Я</em></span>
        </NavLink>
        <button className="searchbtn" onClick={() => setSearch(true)}>
          <SearchIcon size={16} /> <span>Пошук: фільтр, тег, урок, питання</span> <kbd>⌘K</kbd>
        </button>
        <button className="iconbtn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Світла тема' : 'Темна тема'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <nav className={`side${open ? ' side--open' : ''}`} aria-label="Навігація">
        <div className="side__primary">
          {PRIMARY.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `side__main${isActive || (to === '/shopify' && inShopify) || (to === '/docs' && context === 'docs' && pathname !== '/cheatsheet') ? ' is-active' : ''}`}>
              <Icon size={17} aria-hidden /> {label}
            </NavLink>
          ))}
        </div>
        <div className="side__context">
          {context === 'course' && <CourseNav />}
          {context === 'docs' && <DocsNav sections={['basics', 'tags', 'filters']} />}
          {context === 'shopify' && <DocsNav sections={['shopify']} />}
        </div>
        <p className="side__legend" aria-label="Кольори в коді">
          <span className="lg lg--out">{'{{ output }}'}</span>
          <span className="lg lg--tag">{'{% тег %}'}</span>
          <span className="lg lg--filter">| фільтр</span>
        </p>
      </nav>
      {open && <button className="scrim" aria-label="Закрити меню" onClick={() => setOpen(false)} />}

      <main className="main"><Outlet /></main>
      {search && <Search onClose={() => setSearch(false)} />}
    </div>
  )
}
