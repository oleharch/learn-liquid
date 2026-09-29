import type { DocPage, DocSection, InterviewQA, InterviewTopic, Lesson } from './types'
import { basicsPages } from './docs/basics'
import { sandboxPages } from './docs/sandbox'
import { tagsPages } from './docs/tags'
import { filtersA } from './docs/filters-a'
import { filtersB } from './docs/filters-b'
import { filtersC } from './docs/filters-c'
import { shopifyThemePages } from './docs/shopify-theme'
import { shopifyDataPages } from './docs/shopify-data'
import { lessonsPart1 } from './course/part1'
import { lessonsPart2 } from './course/part2'
import { lessonsPart3 } from './course/part3'
import { lessonsPart4 } from './course/part4'
import { qaCore1 } from './interview/core-1'
import { qaCore2 } from './interview/core-2'
import { qaShopify1 } from './interview/shopify-1'
import { qaShopify2 } from './interview/shopify-2'
import { qaShopify3 } from './interview/shopify-3'

export { modules, lessonPlan } from './course/modules'

const byName = (a: DocPage, b: DocPage) => a.slug.localeCompare(b.slug)

export const docs: DocPage[] = [
  ...basicsPages,
  ...sandboxPages,
  ...tagsPages,
  ...[...filtersA, ...filtersB, ...filtersC].sort(byName),
  ...shopifyThemePages,
  ...shopifyDataPages,
]

export const lessons: Lesson[] = [...lessonsPart1, ...lessonsPart2, ...lessonsPart3, ...lessonsPart4].sort((a, b) => a.id.localeCompare(b.id))

export const interview: InterviewQA[] = [...qaCore1, ...qaCore2, ...qaShopify1, ...qaShopify2, ...qaShopify3]

export const docsBySection = (section: DocSection) => docs.filter((d) => d.section === section)
export const findDoc = (section: string, slug: string) => docs.find((d) => d.section === section && d.slug === slug)
export const findLesson = (id: string) => lessons.find((l) => l.id === id)

/** Сторінка за посиланням у форматі `related` / `docs`: 'filters/map'. */
export const resolveRef = (ref: string) => {
  const [section, slug] = ref.split('/')
  return findDoc(section, slug)
}
/** Уроки, які спираються на цю сторінку довідника (зворотний звʼязок до `Lesson.docs`). */
export const lessonsForDoc = (section: string, slug: string) => lessons.filter((l) => l.docs?.includes(`${section}/${slug}`))
/** Уроки, що закривають тему питання співбесіди (зворотний звʼязок до `Lesson.topics`). */
export const lessonsForTopic = (topic: InterviewTopic) => lessons.filter((l) => l.topics?.includes(topic))

export const SECTION_LABELS: Record<DocSection, string> = {
  basics: 'Основи',
  tags: 'Теги',
  filters: 'Фільтри',
  shopify: 'Shopify',
}
