/**
 * Контракт контенту. Увесь навчальний матеріал — це ДАНІ цих типів:
 * з них росте і текст, і зміст, і пошук, і автоперевірка (`pnpm verify`).
 *
 * Головне правило: ВИВІД ПРИКЛАДІВ НІДЕ НЕ ЗАПИСАНИЙ РУКАМИ. Його рахує рушій
 * наживо, тож приклад не може «збрехати». Автор пише лише шаблон і дані.
 */

/**
 * Рядок із міні-розміткою: `код`, **жирний**, *курсив*, [текст](url).
 * Посилання всередині сайту — відносні: [append](/docs/filters/append).
 */
export type Inline = string

/** Готові набори даних магазину (див. src/engine/presets.ts). */
export type PresetId = 'product' | 'collection' | 'cart' | 'shop' | 'customer' | 'blog' | 'all'

/** Живий приклад «Input → Output». Редагується читачем просто на сторінці. */
export interface Example {
  title?: string
  /** Пояснення під прикладом: на що дивитись у виводі. */
  note?: Inline
  template: string
  /** Дані, доступні шаблону як змінні верхнього рівня. */
  data?: Record<string, unknown>
  /** Підмішати мок-дані магазину (product, collection, cart, shop…). */
  preset?: PresetId
  /** Сніпети для {% render %} / {% include %}: ключ — імʼя без розширення. */
  snippets?: Record<string, string>
  /** 'html' — показати ще й відрендерений HTML, а не лише текст. */
  view?: 'text' | 'html'
  /** Приклад НАВМИСНО показує помилку (verify не вважатиме це збоєм). */
  expectError?: boolean
  /**
   * Якщо справжній Shopify (Ruby Liquid) виведе ІНШЕ, ніж пісочниця (LiquidJS) —
   * що саме. Показується окремим рядком під виводом.
   */
  shopifyOutput?: string
}

export type NoteTone =
  /** Нейтральна довідка. */
  | 'info'
  /** Пастка, типова помилка. */
  | 'warn'
  /** Як це працює саме в Shopify-темах. */
  | 'shopify'
  /** Що про це питають на співбесіді і як відповідати. */
  | 'interview'
  /** Порада з практики. */
  | 'tip'

export type Block =
  | { type: 'p'; text: Inline }
  | { type: 'h'; text: string; id?: string }
  | { type: 'list'; items: Inline[]; ordered?: boolean }
  | { type: 'note'; tone: NoteTone; title?: string; text: Inline }
  | ({ type: 'example' } & Example)
  /** Статичний код, який НЕ виконується (JSON схеми, структура теми, JS). */
  | { type: 'code'; lang: 'liquid' | 'json' | 'html' | 'text' | 'js' | 'css'; code: string; title?: string }
  | { type: 'table'; head: string[]; rows: Inline[][] }

/* ─────────────── Довідник ─────────────── */

export type DocSection = 'basics' | 'tags' | 'filters' | 'shopify'

export type FilterCategory = 'string' | 'math' | 'array' | 'date' | 'other'

export interface DocPage {
  /** Унікальний у межах розділу; для фільтра — його імʼя (`append`). */
  slug: string
  section: DocSection
  title: string
  /** Одне-два речення: що це і навіщо. Іде в пошук і шпаргалку. */
  summary: Inline
  /** Лише для фільтрів: `string | append: string`. */
  syntax?: string
  category?: FilterCategory
  blocks: Block[]
  /** Повʼязані сторінки: 'filters/prepend', 'tags/iteration'. */
  related?: string[]
  /** Посилання на оригінал (shopify.github.io або shopify.dev). */
  officialUrl?: string
}

/* ─────────────── Курс ─────────────── */

/** Перевірка тексту рішення: щоб відповідь не можна було захардкодити. */
export interface SourceRule {
  /** Джерело RegExp (без слешів), застосовується до коду учня. Прапорець `s`. */
  pattern: string
  /** Людською мовою, що саме вимагається: «використай фільтр `map`». */
  label: string
}

export interface Exercise {
  /** Глобально унікальний: `l05-e2`. */
  id: string
  title: string
  /** Умова. Кілька абзаців — кілька рядків масиву. */
  task: Inline[]
  /** Що бачить учень у редакторі на старті. НЕ має проходити перевірку. */
  starter: string
  /**
   * Еталонне рішення. Вивід учня порівнюється з виводом еталона
   * (на `data` і, якщо є, на `altData`).
   */
  solution: string
  data?: Record<string, unknown>
  preset?: PresetId
  snippets?: Record<string, string>
  /**
   * Прихований другий набір даних тієї самої форми. Рішення, що працює лише
   * на видимих даних (захардкоджене), на ньому впаде.
   */
  altData?: Record<string, unknown>
  mustUse?: SourceRule[]
  mustNotUse?: SourceRule[]
  /**
   * За замовчуванням пробіли й переноси нормалізуються (будь-яка послідовність
   * пробільних символів = один пробіл). true — порівнювати символ у символ
   * (для уроку про whitespace control).
   */
  strictWhitespace?: boolean
  /** Підказки від найзагальнішої до майже-відповіді. 2–3 штуки. */
  hints: Inline[]
  /** Розбір після успіху: чому рішення саме таке. */
  explain?: Inline
  view?: 'text' | 'html'
}

export interface QuizQuestion {
  /** Глобально унікальний: `l05-q1`. */
  id: string
  q: Inline
  /** Якщо задано — питання «що виведе цей код?», і verify звірить відповідь. */
  template?: string
  data?: Record<string, unknown>
  preset?: PresetId
  options: string[]
  /** Індекс правильного варіанта в `options`. */
  correct: number
  explain: Inline
}

export interface Lesson {
  /** `l01` … `l16`. */
  id: string
  /** Номер модуля (див. course/modules.ts). */
  module: number
  title: string
  /** Що вмітимеш після уроку — одне речення. */
  goal: Inline
  minutes: number
  /** Теорія з живими прикладами. */
  blocks: Block[]
  exercises: Exercise[]
  quiz: QuizQuestion[]
  /** Сторінки довідника до уроку: 'filters/map'. */
  docs?: string[]
  /** Теми питань співбесіди, які закриває урок (звʼязок із банком питань — за темою). */
  topics?: InterviewTopic[]
}

export interface CourseModule {
  id: number
  title: string
  summary: string
}

/* ─────────────── Співбесіда ─────────────── */

export type InterviewTopic =
  | 'basics'
  | 'types'
  | 'operators'
  | 'variables'
  | 'control-flow'
  | 'iteration'
  | 'filters'
  | 'whitespace'
  | 'snippets'
  | 'objects'
  | 'architecture'
  | 'sections'
  | 'performance'
  | 'security'
  | 'debugging'
  | 'practical'

export type InterviewLevel = 'junior' | 'middle' | 'senior'

export interface InterviewQA {
  /** Глобально унікальний: `qa-iter-03`. */
  id: string
  topic: InterviewTopic
  level: InterviewLevel
  q: string
  /**
   * Відповідь «уголос» на 20–40 секунд: те, що реально кажуть на співбесіді.
   * Повні речення, без списків.
   */
  short: Inline
  /** Розгорнутий розбір: приклади, пастки, що спитають далі. */
  blocks: Block[]
  /** Типові уточнювальні питання інтервʼюера. */
  followUps?: string[]
}
