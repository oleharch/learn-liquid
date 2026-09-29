import type { CourseModule } from '../types'

export const modules: CourseModule[] = [
  { id: 1, title: 'Основа', summary: 'Три цеглини Liquid — output, теги, фільтри — і дані, з якими вони працюють.' },
  { id: 2, title: 'Логіка', summary: 'Змінні, умови й цикли: усе, що вирішує, ЩО потрапить у HTML.' },
  { id: 3, title: 'Фільтри', summary: 'String, числа, масиви, дати. Ланцюжки фільтрів замість коду.' },
  { id: 4, title: 'Шаблон', summary: 'Whitespace, коментарі, сніпети й scope змінних.' },
  { id: 5, title: 'Shopify', summary: 'Обʼєкти магазину, секції зі схемою, гроші, зображення, pagination.' },
  { id: 6, title: 'Майстерність', summary: 'Performance, debugging і фінальний проєкт.' },
]

/** План курсу: id уроку → модуль і тема. Самі уроки — у part1…part4. */
export const lessonPlan: { id: string; module: number; title: string }[] = [
  { id: 'l01', module: 1, title: 'Що таке Liquid: output, теги, фільтри' },
  { id: 'l02', module: 1, title: 'Типи даних і доступ до них' },
  { id: 'l03', module: 1, title: 'Оператори, truthy і falsy' },
  { id: 'l04', module: 2, title: 'Змінні: assign, capture, increment, decrement' },
  { id: 'l05', module: 2, title: 'Умови: if, unless, elsif, case' },
  { id: 'l06', module: 2, title: 'Цикл for: параметри й обʼєкт forloop' },
  { id: 'l07', module: 2, title: 'Цикли далі: break, continue, cycle, tablerow, else' },
  { id: 'l08', module: 3, title: 'Фільтри для string' },
  { id: 'l09', module: 3, title: 'Числа й математика' },
  { id: 'l10', module: 3, title: 'Масиви: map, where, sort, uniq та інші' },
  { id: 'l11', module: 3, title: 'Дати, default, escape і безпека output' },
  { id: 'l12', module: 4, title: 'Whitespace, коментарі, raw, liquid та echo' },
  { id: 'l13', module: 4, title: 'Сніпети: render проти include, scope' },
  { id: 'l14', module: 5, title: 'Обʼєкти магазину: product, variant, collection, cart' },
  { id: 'l15', module: 5, title: 'Секції, схема, блоки й налаштування' },
  { id: 'l16', module: 5, title: 'Гроші, зображення, pagination, форми' },
  { id: 'l17', module: 6, title: 'Performance, debugging, типові помилки' },
  { id: 'l18', module: 6, title: 'Фінальний проєкт: картка product, сітка колекції, cart' },
]
