# Як писати контент для «Liquid від А до Я»

Сайт — український тренажер Liquid для Shopify-розробника, який готується до
технічної співбесіди. Читач — верстальник із досвідом HTML/CSS/JS, уже бачив
Shopify-теми, але хоче знати Liquid **повністю**: і писати, і ПОЯСНЮВАТИ вголос.

## Залізні правила

1. **Ти володієш лише своїми файлами** (названі в завданні). Інших не чіпай —
   паралельно працюють ще 12 авторів. Не запускай dev-сервер, не роби git-комітів,
   не став пакети, не запускай prettier.
2. **Контракт — `src/content/types.ts`.** Прочитай його повністю першим ділом.
   Твій файл експортує масив під ТИМ САМИМ іменем, що вже стоїть у заглушці.
3. **Вивід прикладів не записуєш.** Пишеш `template` (+ `data`/`preset`/`snippets`) —
   вивід порахує рушій. Тому ніколи не стверджуй у тексті конкретний результат,
   якого не перевірив. Перевіряй:
   `pnpm verify src/content/<твій файл>.ts` — проганяє кожен приклад, еталон кожного
   завдання і кожен тест. **Твоя робота закінчена, лише коли verify зелений.**
   Побачити реальний вивід шаблону:
   `pnpm exec tsx scripts/try.ts '<шаблон>' [preset]` (або `--file шлях`).
4. **Типи мають сходитися:** `pnpm exec tsc --noEmit -p .` — без помилок у твоїх файлах.
   **Термінологія має сходитися:** `pnpm lint:terms src/content/<твій файл>.ts` —
   нуль помилок, попередження переглянуті (правила — `GLOSSARY.md`).
5. **Не копіюй офіційну документацію.** Пояснюй своїми словами, приклади вигадуй
   свої (магазин засобів для волосся «Liquid Lab», але не тільки). Факти — з
   офіційних джерел: https://shopify.github.io/liquid/ і https://shopify.dev/docs/api/liquid.
   Повні дані довідки Shopify лежать у `vendor/theme-liquid-docs/*.json` — звіряй
   з ними синтаксис, параметри, deprecated.
6. **Не вигадуй фактів.** Не впевнений у ліміті, версії чи поведінці — перевір у
   `vendor/…json` або опусти. Помилка в навчальному матеріалі гірша за пропуск.

## Мова

- Українська, на «ти», живо і по суті. Без канцеляриту, без «давайте розглянемо»,
  без «важливо зазначити». Короткі абзаци.
- **Терміни — за `GLOSSARY.md`, і це не побажання.** Коротко: поняття, які
  професіонали кажуть англійською, пишемо латиницею без відмінювання — output,
  scope, whitespace control, layout, assets, deprecated, metafield, metaobject,
  theme settings, pagination, performance, debugging; обʼєкти Shopify як дані —
  product, cart, customer, line item; тип рядка — string. Усталене українське
  лишається: тег, фільтр, обʼєкт, масив, змінна, цикл, сніпет, секція, блок,
  схема, пресет. Дієслова — українські: виводить, рендерить, ескейпить (не
  «друкує»). Текст UI магазину всередині шаблонів («Додати в кошик») — українською.
  Апостроф — `ʼ` (U+02BC).
- Імена тегів/фільтрів/змінних завжди в `бектиках`.
- Пояснюй **чому**, а не лише **як**: звідки береться поведінка, яку помилку вона
  провокує, як це виглядає в реальній темі.

## Inline-розмітка

У полях типу `Inline`: `` `код` ``, `**жирний**`, `*курсив*`, `[текст](/docs/filters/map)`.
Більше нічого (ні заголовків, ні списків — для них є блоки). Внутрішні посилання
звіряє verify, тож лінкуй лише на адреси зі списку нижче.

## Блоки (`Block`)

`p`, `h`, `list`, `note` (tone: `info` | `warn` | `tip` | `shopify` | `interview`),
`example` (живий Input/Output), `code` (статичний, НЕ виконується), `table`.

- `note` tone **`interview`** — «як про це спитають і що відповісти». На кожній
  сторінці довідника і в кожному уроці має бути щонайменше одна.
- `note` tone **`shopify`** — як це працює саме в темах Shopify.
- `note` tone **`warn`** — пастка, на якій реально помиляються.
- `example.note` — на що дивитись у виводі.
- `example.shopifyOutput` — став, якщо справжній Shopify виведе інше, ніж пісочниця.
- `example.expectError: true` — приклад навмисно показує помилку.
- `example.view: 'html'` — коли шаблон генерує HTML, який варто побачити відрендереним.

## Рушій: що вміє пісочниця

LiquidJS 10 + емуляція Shopify (`src/engine/shopify.ts` — прочитай). Коротко:

- Усі базові теги й фільтри Liquid, включно з `liquid`, `echo`, `render`, `include`,
  `tablerow`, `cycle`, `increment`, інлайн-коментарем `{% # … %}`, а також
  `find`, `find_index`, `has`, `reject`, `sum`, `where`, `json`, `base64_*`.
- **Shopify-фільтри:** `money*`, `handleize`, `camelize`, `pluralize`, `image_url`
  (без width/height — помилка), `image_tag`, `img_url`, `asset_url`, `file_url`,
  `stylesheet_tag`, `script_tag`, `preload_tag`, `link_to*`, `url_for_*`, `within`,
  `sort_by`, `t`/`translate` (словник — змінна `locales`, локаль — `request.locale.iso_code`;
  нема ключа → `translation missing: uk.key`), `time_tag`, `weight_with_unit`,
  `default_pagination`, `highlight`, `placeholder_svg_tag`, `item_count_for_variant`.
- **Shopify-теги:** `schema` (валідовує JSON; з нього автоматично збирається обʼєкт
  `section`: settings із `default`, blocks із першого пресета), `doc`, `style`,
  `stylesheet`/`javascript` (нічого не друкують), `section 'name'` (бере сніпет
  `sections/name`), `content_for 'blocks'` (сніпети `blocks/<type>`), `form`,
  `paginate … by N` (сторінка — змінна `current_page`), `layout`.
- `{% render 'card', product: p %}` працює зі `snippets: { card: '…' }`.
- Решта Shopify-фільтрів (`color_*`, `font_*`, `metafield_tag`, `payment_*`,
  `media_tag`, `video_tag`…) НЕ емулюються → у живих прикладах їх не використовуй,
  показуй блоком `code` (статичний).

### Що підігнано під Shopify (і вже НЕ є розбіжністю)

- **`{% render %}` бачить глобальні обʼєкти.** Дані пресета й `data` передаються
  рушію як `globals`, тому всередині сніпета видно `shop`, `product`, `settings` —
  як у Shopify, — а змінні з `{% assign %}` не видно. `{% include %}` бачить усе.
- **`forloop.parentloop`** працює на будь-якій вкладеності; на верхньому рівні
  порожній. (Самого LiquidJS це не вміє — дописано в `src/engine/liquid.ts`.)
- **`divided_by`** ділить ціле на ціле націло, як Ruby.

### Відомі розбіжності з Ruby-Liquid (кажи про них чесно)

- `divided_by` підігнано під Ruby: ціле/ціле → націло. Дробовість видно лише з
  літерала ДІЛЬНИКА (`4.0`). `{{ 10.0 | divided_by: 4 }}` дасть 2 (у Shopify 2.5).
- Цілі дробові: `{{ 4.0 | times: 2 }}` → `8` (у Shopify `8.0`). Став `shopifyOutput`.
- `round` відʼємних половинок, сортування `nil`, точний текст помилок можуть
  відрізнятись — не будуй на цьому приклади.
- Помилка зупиняє рендер (у Shopify на сторінку друкується `Liquid error: …`).
- Обʼєкти — звичайний JSON, не Drop-и.

## Пресети даних (`preset`)

`src/engine/presets.ts` — прочитай, щоб знати точні поля. `product` (Шампунь із
кератином, 3 варіанти, один недоступний), `collection` (5 товарів, різні вендори,
теги, один недоступний, один без фото), `cart` (3 позиції, одна зі знижкою),
`customer`, `blog` (3 статті), `shop` (shop, routes, settings, linklists, request),
`all` (усе разом + `collections`, `all_products`, `blogs`). **Гроші — в копійках**
(`64900` = 649,00 ₴), формат магазину `{{amount}} ₴`.

**Метаполя мають СПРАВЖНЮ форму Shopify** — `{ value, type, 'list?' }`, а не пласке
значення. Тому в прикладах завжди пиши `.value`: `product.metafields.custom.ph.value`.
Без нього надрукується `[object Object]` — і це правильно, бо в Shopify теж буде не
значення. Що є на товарі (namespace `custom`): `volume_note`, `ph`, `is_professional`
(boolean **false** — для пасток), `sulfate_free`, `how_to_use` (багаторядковий),
`ingredients` і `pickup` (`list.*`), `lab` (`json`), `size` (ключ-пастка — бери
дужками), `similar` (`list.product_reference`), `brand` (`metaobject_reference`).
Ще є namespace `legacy` з пласким значенням — застарілі типи Shopify справді
віддають значення напряму. Метаполя є також на варіанті (`volume_ml`), колекції,
магазині, клієнтці й статті. Глобальний `metaobjects` має типи `brand` і `faq`;
поля метаобʼєкта — теж метаполя (`brand.title.value`), службове — під `system`.

Для базових тем (типи, оператори, рядки) давай маленькі власні `data` — пресет
там лише заважає.

## Карта адрес (для посилань і `related` / `docs`)

- `/docs/basics/<slug>`: introduction, operators, truthy-and-falsy, types, variations,
  whitespace, sandbox
- `/docs/tags/<slug>`: control-flow, iteration, template, variable
- `/docs/filters/<імʼя>`: abs, append, at_least, at_most, capitalize, ceil, compact,
  concat, date, default, divided_by, downcase, escape, escape_once, find, find_index,
  first, floor, has, join, last, lstrip, map, minus, modulo, newline_to_br, plus,
  prepend, reject, remove, remove_first, remove_last, replace, replace_first,
  replace_last, reverse, round, rstrip, size, slice, sort, sort_natural, split, strip,
  strip_html, strip_newlines, sum, times, truncate, truncatewords, uniq, upcase,
  url_decode, url_encode, where
- `/docs/shopify/<slug>`: architecture, layouts-and-templates, json-templates,
  sections-and-schema, blocks, section-groups, snippets-render, theme-settings,
  locales, assets, objects-overview, product-and-variant, collection-and-pagination,
  cart, customer, metafields, money-filters, images, url-and-html-filters, forms,
  search, performance, liquid-and-js, security, debugging, deprecated
- `/learn/l01` … `/learn/l18` (теми — `src/content/course/modules.ts`)
- `/playground`, `/interview`, `/cheatsheet`, `/shopify/reference`
- у `related` і `docs` — без префікса `/docs/`: `'filters/map'`, `'tags/iteration'`.

## Еталон сторінки фільтра

```ts
{
  slug: 'truncate', section: 'filters', title: 'truncate', category: 'string',
  syntax: 'string | truncate: number, string',
  summary: 'Обрізає рядок до заданої кількості символів і дописує в кінець три крапки (або свій хвіст).',
  officialUrl: 'https://shopify.github.io/liquid/filters/truncate/',
  related: ['filters/truncatewords', 'filters/slice'],
  blocks: [
    { type: 'p', text: '…що робить і коли потрібен, 2–4 речення…' },
    { type: 'example', title: 'Базовий випадок', template: '{{ "Шампунь із кератином" | truncate: 12 }}',
      note: 'Три крапки **входять** у ліміт: 9 символів тексту + 3 крапки = 12.' },
    { type: 'h', text: 'Параметри' },
    { type: 'table', head: ['Параметр', 'Тип', 'Що робить'], rows: [/* … */] },
    { type: 'example', title: 'Свій хвіст', template: '…' },
    { type: 'example', title: 'Без хвоста', template: '…' },
    { type: 'note', tone: 'warn', title: 'Пастка', text: '…' },
    { type: 'note', tone: 'shopify', text: '…де це в реальній темі: картка товару, мета-опис…' },
    { type: 'note', tone: 'interview', title: 'На співбесіді', text: '…типове питання і відповідь…' },
  ],
}
```

Мінімум на фільтр: вступ, 2–4 живі приклади (базовий, з параметрами, межовий
випадок — порожній рядок / `nil` / не той тип), таблиця параметрів (якщо вони є),
пастка, нотатка `interview`. Хороша сторінка фільтра — 8–14 блоків.

## Завдання курсу (`Exercise`)

- Перевірка: вивід учня == вивід `solution` на `data`, і ще раз на `altData`.
  Тож `altData` — **тієї самої форми, з іншими значеннями**, і еталон на ньому
  мусить давати ІНШИЙ вивід (verify попередить, якщо ні).
- `starter` — заготовка з коментарем-підказкою `{% comment %}…{% endcomment %}` або
  частиною розмітки; вона НЕ має проходити перевірку.
- `mustUse` — коли важливо, ЯК розвʼязано (`pattern: '\\|\\s*map\\b'`,
  `label: 'Використай фільтр `map`'`). Не перестарайся: одна-дві вимоги.
- Пробіли нормалізуються, тож учень вільний у форматуванні. Виняток —
  `strictWhitespace: true` для уроку про керування пробілами.
- Складність зростає всередині уроку: перше завдання — на одну дію, останнє —
  маленька реальна задача з теми (шматок картки товару, меню, бейдж знижки).
- 4 завдання і 4 тести на урок. `hints` — 2–3, від натяку до майже-відповіді.
- `explain` — розбір після успіху: чому так, яка альтернатива.

## Тести (`QuizQuestion`)

Половина — «що виведе цей код?» із `template` (verify звірить правильний варіант
із рушієм, тож `options[correct]` має збігатися з реальним виводом з точністю до
пробілів). Решта — концептуальні. Хибні варіанти — правдоподібні, побудовані на
реальних помилках (плутанина truthy, порядок фільтрів, область видимості).
Якщо правильна відповідь — помилка, пиши варіант зі словом «Помилка».

## Питання співбесіди (`InterviewQA`)

- `q` — так, як питає живий інтервʼюер.
- `short` — відповідь УГОЛОС на 20–40 секунд: звʼязний текст із 3–5 речень, який
  можна вивчити й сказати. Спершу суть, потім уточнення, в кінці — практичний
  приклад або застереження. Не списком.
- `blocks` — розгорнутий розбір: живий приклад (де можливо), пастка, порівняльна
  таблиця, що сказати, щоб виглядати сильніше.
- `followUps` — 2–3 уточнення, які реально прилітають далі. Кожне — обʼєкт
  `{ q, a, to? }`: `q` — питання словами інтервʼюера, `a` — відповідь уголос на
  2–4 речення (не список, від 40 символів), `to` — куди піти довчити:
  `'/docs/filters/escape'`, `'/learn/l05'` або інше питання банку
  `'/interview?q=qa-basics-02'`. Посилання verify звіряє. Без `to` — лише коли
  сторінки з цією темою справді немає.
- Рівні: `junior` (що це і як працює), `middle` (відмінності, пастки, вибір між
  підходами), `senior` (архітектура теми, продуктивність, компроміси, масштаб).
