import type { DocPage } from '../types'

/* ═══════════════════════════ 1. Умови ═══════════════════════════ */

const controlFlow: DocPage = {
  slug: 'control-flow',
  section: 'tags',
  title: 'Умови: if, unless, case',
  summary:
    'Теги, які вирішують, що потрапить в output: `if` / `elsif` / `else`, `unless`, `case` / `when`. Плюс порядок `and` / `or` без дужок і помилки, на яких ловлять на співбесідах.',
  officialUrl: 'https://shopify.github.io/liquid/tags/control-flow/',
  related: ['basics/operators', 'basics/truthy-and-falsy', 'tags/iteration', 'tags/variable', 'filters/default'],
  blocks: [
    {
      type: 'p',
      text: 'Теги умов самі нічого не виводять — вони лише вмикають і вимикають шматки шаблону. Усього їх три: `if` (з `elsif` та `else`), його дзеркало `unless` і `case` для вибору з готового переліку значень. Синтаксично все просто; складність у тому, **що саме Liquid вважає істиною** і **в якому порядку читає складні умови** — і те, й інше не так, як у JavaScript.',
    },
    { type: 'h', text: 'if та else' },
    {
      type: 'example',
      title: 'Базова розвилка',
      template: `{% if product.available %}
  <button>Додати в кошик</button>
{% else %}
  <button disabled>Немає в наявності</button>
{% endif %}`,
      data: { product: { available: false } },
      note: 'Кожен `if` закривається своїм `{% endif %}`. Зміни `available` на `true` — спрацює перша гілка.',
    },
    {
      type: 'p',
      text: 'Умова — це або порівняння (`==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`), або просто значення. Коли значення стоїть без оператора, Liquid перевіряє його на truthy. Хибними вважаються **лише `false` і `nil`**. Нуль, порожній string і порожній масив — truthy. Детально — на сторінці [truthy і falsy](/docs/basics/truthy-and-falsy).',
    },
    {
      type: 'example',
      title: 'Що проходить крізь if',
      template: `{% if zero %}0 — truthy{% endif %}
{% if empty_string %}"" — truthy{% endif %}
{% if empty_array %}[] — truthy{% endif %}
{% if nothing %}nil — truthy{% else %}nil — falsy{% endif %}
{% if product.metafields.custom.badge %}є бейдж{% else %}неіснуюча властивість — теж nil{% endif %}`,
      data: { zero: 0, empty_string: '', empty_array: [], product: { metafields: { custom: {} } } },
      note: 'Звернення до властивості, якої немає, не ламає шаблон: ланцюжок просто повертає `nil`. Тому `{% if a.b.c %}` — безпечна перевірка на існування.',
    },
    { type: 'h', text: 'elsif' },
    {
      type: 'example',
      title: 'Кілька гілок',
      template: `{% if qty == 0 %}
  Немає в наявності
{% elsif qty <= 3 %}
  Залишилось {{ qty }} шт. — поспішай
{% elsif qty <= 10 %}
  Закінчується
{% else %}
  В наявності
{% endif %}`,
      data: { qty: 3 },
      note: 'Гілки перевіряються згори вниз, спрацьовує **перша** істинна, решта пропускаються. Тому порядок має значення: `qty <= 10` істинне і для трійки, але до нього черга не дійшла.',
    },
    {
      type: 'example',
      title: 'Пастка: elseif',
      template: `{% if size == 'S' %}мала{% elseif size == 'M' %}середня{% endif %}`,
      data: { size: 'M' },
      expectError: true,
      note: 'У Liquid це слово пишеться **`elsif`** — як у Ruby, без другої `e`. Варіантів `elseif`, `else if` та `elif` не існує. Помилка банальна, але саме її найчастіше роблять ті, хто приходить із PHP чи JavaScript.',
    },
    { type: 'h', text: 'unless' },
    {
      type: 'example',
      title: 'if навпаки',
      template: `{% unless product.available %}
  Товар тимчасово відсутній
{% endunless %}`,
      data: { product: { available: false } },
      note: '`unless x` — це те саме, що `if` із запереченням умови. Окремого оператора «не» в Liquid немає, тож `unless` — єдиний спосіб заперечити truthy-перевірку в один рядок.',
    },
    {
      type: 'p',
      text: 'Формально `unless` підтримує і `else`, і навіть `elsif`. На практиці **`unless` + `else` — антипатерн**: читач мусить тримати в голові подвійне заперечення («якщо НЕ доступний — …, інакше, тобто якщо НЕ-НЕ доступний — …»). Те саме з `unless a or b`: щоб зрозуміти, коли спрацює тіло, доводиться застосовувати закон де Моргана в голові.',
    },
    {
      type: 'example',
      title: 'Те саме двома способами',
      template: `{%- comment %} Читається погано {% endcomment -%}
{% unless customer %}Увійди, щоб бачити ціни{% else %}Привіт, {{ customer.first_name }}{% endunless %}

{% comment %} Читається одразу {% endcomment -%}
{% if customer %}Привіт, {{ customer.first_name }}{% else %}Увійди, щоб бачити ціни{% endif %}`,
      data: { customer: { first_name: 'Софія' } },
      note: 'Output однаковий. Правило з практики: `unless` — лише для **однієї простої умови без `else`**. Щойно зʼявляється друга гілка чи `and` / `or` — переписуй на `if`.',
    },
    { type: 'h', text: 'case / when' },
    {
      type: 'example',
      title: 'Вибір зі списку значень',
      template: `{% case product.type %}
  {%- when 'Шампунь', 'Кондиціонер' %}
  Крок 1: очищення
  {%- when 'Маска' or 'Олійка' %}
  Крок 2: догляд
  {%- when 'Спрей' %}
  Крок 3: захист
  {%- else %}
  Інше
{% endcase %}`,
      data: { product: { type: 'Олійка' } },
      note: 'В одному `when` може бути кілька значень — через **кому** або через **`or`**, це рівнозначно. `else` спрацьовує, коли не підійшло жодне. Усе, що стоїть між `{% case %}` і першим `{% when %}`, ігнорується.',
    },
    {
      type: 'example',
      title: 'case порівнює як ==, типи важливі',
      template: `{% case columns %}
  {%- when 3 %}число 3
  {%- when '3' %}рядок "3"
  {%- else %}щось інше
{% endcase %}`,
      data: { columns: '3' },
      note: '`when` — це звичайне `==`, а `==` у Liquid типи не приводить: string `"3"` не дорівнює числу `3`. Класичне джерело таких string — settings секції чи theme settings типу `select` і `text`, а ще `capture`. У `when` можна ставити й змінну, не лише літерал.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Чого case не вміє',
      text: '`case` перевіряє лише **рівність**. Діапазонів (`when > 10`), `contains` чи складених умов у `when` немає — для цього потрібен ланцюжок `if` / `elsif`. Беруть `case`, коли є одна змінна і скінченний перелік її значень: тип блока секції, `template.name`, значення `select`-налаштування.',
    },
    { type: 'h', text: 'and / or: справа наліво, без дужок' },
    {
      type: 'p',
      text: 'В одній умові можна поєднати кілька перевірок через `and` та `or`. Але в Liquid **немає пріоритету операторів** (у JavaScript `&&` сильніший за `||`) і **немає дужок**. Ланцюжок завжди читається **справа наліво**: спершу обчислюється найправіша пара, її результат поєднується з тим, що лівіше, і так далі.',
    },
    {
      type: 'example',
      title: 'Той самий вираз, інша відповідь, ніж у JS',
      template: `{% if false and false or true %}так{% else %}ні{% endif %}`,
      note: 'JavaScript порахував би `(false && false) || true` → `true`. Liquid групує з правого краю: `false and (false or true)` → `false and true` → хибно.',
    },
    {
      type: 'example',
      title: 'Як це стріляє в реальній темі',
      template: `{%- comment %} Хочемо: (VIP або розпродаж) і товар є в наявності {% endcomment -%}
Невдалий порядок: {% if is_vip or on_sale and available %}показати кнопку{% else %}сховати{% endif %}
Вдалий порядок:   {% if available and is_vip or on_sale %}показати кнопку{% else %}сховати{% endif %}`,
      data: { is_vip: true, on_sale: false, available: false },
      note: 'Перший рядок читається як `is_vip or (on_sale and available)` — VIP-клієнтка побачить кнопку купівлі для product, якого немає в наявності. Другий — як `available and (is_vip or on_sale)`, і це саме те, що треба. Якщо потрібна група, яку порядком не виразити, — розбий умову на вкладені `if` або винеси частину у змінну-прапорець через `assign`.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Дужок не існує',
      text: 'Запис `{% if (a or b) and c %}` — не групування. Круглі дужки в Liquid мають рівно одне значення: діапазон `(1..5)`. Пісочниця на такій умові падає з помилкою про діапазон; у темі не розраховуй, що дужки хоч якось вплинуть на порядок. Єдині інструменти групування — порядок запису і вкладеність.',
    },
    { type: 'h', text: 'Вкладені умови' },
    {
      type: 'example',
      title: 'Вкладеність замість дужок',
      template: `{% if product.available %}
  {%- if product.compare_at_price > product.price %}
  Знижка! Було {{ product.compare_at_price | money }}, стало {{ product.price | money }}
  {%- else %}
  {{ product.price | money }}
  {%- endif %}
{% else %}
  Немає в наявності
{% endif %}`,
      preset: 'product',
      note: 'Вкладати можна скільки завгодно, але глибше двох рівнів шаблон стає нечитабельним. Тоді допомагає «ранній вихід»: обчисли прапорець через `assign` вище по коду, а в розмітці лиши один плоский `if`.',
    },
    { type: 'h', text: 'Типові помилки' },
    {
      type: 'example',
      title: 'Порівняння з true',
      template: `{% if subtitle == true %}перша гілка{% else %}== true не спрацювало{% endif %}
{% if subtitle %}а просто if — спрацював{% endif %}`,
      data: { subtitle: 'Безсульфатний догляд' },
      note: '`== true` — це **порівняння**, а не перевірка на truthy. String не дорівнює булевому `true`, тож умова хибна. Порівнювати з `true` має сенс лише для справжніх булевих значень (чекбокс у налаштуваннях, `product.available`), але й там простіше писати `{% if x %}`.',
    },
    {
      type: 'example',
      title: 'Порожній string: if, blank, empty',
      template: `{% for row in rows -%}
  {{ row.name }} → if: {% if row.value %}так{% else %}ні{% endif %} · == blank: {% if row.value == blank %}так{% else %}ні{% endif %} · == empty: {% if row.value == empty %}так{% else %}ні{% endif %}
{% endfor %}`,
      data: {
        rows: [
          { name: '""', value: '' },
          { name: '"   "', value: '   ' },
          { name: 'nil', value: null },
          { name: '[]', value: [] },
          { name: '"текст"', value: 'текст' },
        ],
      },
      note: 'Порожній string проходить `if` — тому `{% if section.settings.heading %}` намалює порожній `<h2>`, коли поле очистили. Надійна перевірка «тут є що показати» — **`!= blank`**: вона відсікає і `nil`, і `""`, і string із самих пробілів. `empty` вужчий: лише порожній string або порожня колекція.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'String проти числа',
      text: 'Оператори `>` і `<` не приводять типи. Число, яке прийшло як string (текстове налаштування, результат `capture`, частина `split`), треба спершу перетворити: `{% assign n = value | plus: 0 %}`. У Shopify порівняння string із числом дає `Liquid error`, а не тихе `false`; пісочниця тут поблажливіша, тож не перевіряй цю поведінку на ній.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'У темах',
      text: 'Найчастіші умови в реальній темі: `{% if section.settings.heading != blank %}` (не малювати порожні теги), `{% if product.available %}`, `{% if customer %}` (чи customer увійшов), `{% if template.name == \'product\' %}`, `{% if product.tags contains \'хіт\' %}`, а `case` — майже завжди по `block.type` усередині циклу блоків секції.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: у якому порядку обчислюються and і or?',
      text: 'Відповідь: «Справа наліво, без пріоритетів і без дужок. `a or b and c` — це `a or (b and c)`, а `a and b or c` — це `a and (b or c)`. Якщо потрібне інше групування, переставляю операнди, вкладаю `if` або виношу частину умови в `assign`». Сильний хід — навести `false and false or true`, яке в Liquid хибне, а в JavaScript істинне.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: які значення falsy?',
      text: 'Лише `nil` і `false`. Далі зазвичай питають: «а як тоді перевірити порожній string?» — через `== blank` (або `!= blank`), і «чим `blank` відрізняється від `empty`?» — `blank` охоплює ще й `nil` та string із пробілів, `empty` — тільки порожній string, масив чи хеш.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: коли case, а коли if/elsif?',
      text: '`case` — коли одна змінна порівнюється на рівність із переліком значень: коротше і видно намір. `if` / `elsif` — коли умови різнорідні, є `>` / `<`, `contains` чи комбінації через `and` / `or`. Про `unless` скажи, що вживаєш його лише без `else`: подвійне заперечення погіршує читабельність, а вигоди не дає.',
    },
  ],
}

/* ═══════════════════════════ 2. Цикли ═══════════════════════════ */

const iteration: DocPage = {
  slug: 'iteration',
  section: 'tags',
  title: 'Цикли: for, cycle, tablerow',
  summary:
    'Тег `for` з усіма параметрами (`limit`, `offset`, `reversed`, діапазони), обʼєкт `forloop`, `break` / `continue`, `else` для порожньої колекції, а також `cycle`, `tablerow` і ліміт Shopify на 50 ітерацій.',
  officialUrl: 'https://shopify.github.io/liquid/tags/iteration/',
  related: ['tags/control-flow', 'tags/variable', 'filters/where', 'filters/map', 'filters/reverse', 'shopify/collection-and-pagination', 'shopify/performance'],
  blocks: [
    {
      type: 'p',
      text: 'Цикл у Liquid один — `for`. Немає ні `while`, ні циклу з довільною умовою: можна лише **пройтись по готовій колекції** (масиву, хешу, діапазону чисел). Це свідоме обмеження мови шаблонів — вічний цикл у темі неможливий за побудовою. Усе інше на цій сторінці — способи керувати цим проходом.',
    },
    { type: 'h', text: 'for' },
    {
      type: 'example',
      title: 'Пройтись по кожному product у collection',
      template: `<ul>
{%- for product in collection.products %}
  <li>{{ product.title }} — {{ product.price | money }}</li>
{%- endfor %}
</ul>`,
      preset: 'collection',
      note: 'Змінна `product` існує лише всередині циклу. Дефіси в `{%-` прибирають порожні рядки, які інакше лишив би кожен тег, — деталі на сторінці про [whitespace control](/docs/basics/whitespace).',
    },
    {
      type: 'p',
      text: 'Ітерувати можна масив, **діапазон** `(1..5)` і **хеш** — тоді кожен елемент є парою, де `pair[0]` — ключ, а `pair[1]` — значення. String — не колекція символів: цикл по string виконається один раз із цілим значенням. А от **фільтр у заголовку `for` не працює** — це одна з найпідступніших помилок, бо вона мовчазна.',
    },
    {
      type: 'example',
      title: 'Пастка: фільтр у заголовку for',
      template: `Фільтр у заголовку (ігнорується):
{%- for product in collection.products | where: 'available' %}
  {{ product.title }}{% unless product.available %} ← недоступний, але він тут{% endunless %}
{%- endfor %}

Спершу assign, потім цикл:
{%- assign in_stock = collection.products | where: 'available' %}
{%- for product in in_stock %}
  {{ product.title }}
{%- endfor %}`,
      preset: 'collection',
      note: 'Тег `for` читає лише назву колекції та свої параметри — усе після `|` він просто не помічає, і помилки при цьому немає. Масив треба підготувати **заздалегідь** через `assign` із потрібними фільтрами ([where](/docs/filters/where), [sort](/docs/filters/sort), [reverse](/docs/filters/reverse)).',
    },
    { type: 'h', text: 'else у for: порожня колекція' },
    {
      type: 'example',
      title: 'Коли ітерувати нема чого',
      template: `{% for item in cart_items %}
  {{ item.title }}
{% else %}
  Кошик порожній — саме час щось обрати.
{% endfor %}

{% for article in blog_that_does_not_exist.articles %}
  {{ article.title }}
{% else %}
  Статей ще немає.
{% endfor %}`,
      data: { cart_items: [] },
      note: '`else` усередині `for` спрацьовує, коли цикл не зробив **жодної** ітерації: масив порожній або його взагалі немає (`nil`). Це заміна конструкції «`if size > 0` → `for` → `else`» — на один рівень вкладеності менше.',
    },
    { type: 'h', text: 'break і continue' },
    {
      type: 'example',
      title: 'Пропустити елемент і вийти достроково',
      template: `{% for n in (1..8) -%}
  {%- if n == 2 %}{% continue %}{% endif -%}
  {%- if n == 6 %}{% break %}{% endif -%}
  {{ n }}
{% endfor %}`,
      note: '`continue` перескакує до наступної ітерації, `break` зупиняє цикл цілком. У вкладених циклах обидва діють лише на **найближчий** цикл. Типовий випадок для `break`: знайти перший варіант, що підходить під умову, і не перебирати далі.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'break поза циклом',
      text: 'У Shopify `{% break %}` **поза** циклом працює як ранній вихід: решта поточного файлу не рендериться, а вже виведене лишається. Секція, блок теми чи сніпет, викликаний через `render`, мають власний контекст, тож зупиняється лише цей файл, а сторінка рендериться далі. Зі сніпетом через deprecated `include` контекст спільний — `break` зупинить і файл, що його підключив. Приклад — на сторінці [тегів шаблону](/docs/tags/template).',
    },
    { type: 'h', text: 'Параметри: limit, offset, reversed, діапазон' },
    {
      type: 'table',
      head: ['Параметр', 'Приклад', 'Що робить'],
      rows: [
        ['`limit`', '`for p in products limit: 4`', 'Зробити не більше N ітерацій.'],
        ['`offset`', '`for p in products offset: 2`', 'Пропустити перші N елементів і почати з наступного.'],
        ['`offset: continue`', '`for p in products offset: continue`', 'Почати там, де зупинився попередній цикл по цьому самому масиву.'],
        ['`reversed`', '`for p in products reversed`', 'Пройти у зворотному порядку. Значення не має — це прапорець.'],
        ['діапазон', '`for i in (1..n)`', 'Числа від першого до останнього **включно**, з кроком 1. Межі — літерали або змінні.'],
      ],
    },
    {
      type: 'example',
      title: 'limit та offset',
      template: `{% for n in numbers limit: 3 %}{{ n }} {% endfor %}
{% for n in numbers offset: 4 %}{{ n }} {% endfor %}
{% for n in numbers offset: skip limit: per_row %}{{ n }} {% endfor %}`,
      data: { numbers: [1, 2, 3, 4, 5, 6, 7, 8], skip: 2, per_row: 3 },
      note: 'Значеннями можуть бути змінні — наприклад, `section.settings.products_to_show`. Параметри пишуться через пробіл, кома між ними не потрібна.',
    },
    {
      type: 'example',
      title: 'offset: continue — продовжити з того ж місця',
      template: `Головні: {% for p in collection.products limit: 2 %}{{ p.title }}; {% endfor %}
Решта:   {% for p in collection.products offset: continue %}{{ p.title }}; {% endfor %}`,
      preset: 'collection',
      note: 'Другий цикл памʼятає, де зупинився перший. Звʼязка тримається на парі «імʼя змінної циклу + назва колекції», тож у обох циклах вони мають збігатися. Зручно, коли перші елементи верстаються великими картками, а решта — списком.',
    },
    {
      type: 'example',
      title: 'Діапазон зі змінними',
      template: `{% assign stars = 4 -%}
{% for i in (1..5) %}{% if i <= stars %}★{% else %}☆{% endif %}{% endfor %}

{% for i in (first..product.variants.size) %}варіант №{{ i }} {% endfor %}

{% for i in (5..1) %}{{ i }}{% else %}зворотний діапазон порожній{% endfor %}`,
      data: { first: 2, product: { variants: ['a', 'b', 'c', 'd'] } },
      note: 'Діапазон — спосіб повторити щось N разів, коли масиву немає: зірочки рейтингу, порожні клітинки сітки, скелетони. Якщо початок більший за кінець, діапазон порожній — рахувати назад він не вміє, для цього є `reversed`.',
    },
    { type: 'h', text: 'Порядок застосування параметрів' },
    {
      type: 'example',
      title: 'reversed завжди останній',
      template: `{% for n in numbers reversed limit: 2 %}{{ n }} {% endfor %}
{% for n in numbers limit: 2 reversed %}{{ n }} {% endfor %}

{% assign backwards = numbers | reverse -%}
{% for n in backwards limit: 2 %}{{ n }} {% endfor %}`,
      data: { numbers: [1, 2, 3, 4, 5, 6] },
      note: 'Як не переставляй параметри в тегу, порядок застосування сталий: **спершу `offset`, потім `limit`, і лише в кінці `reversed`**. Тому `reversed limit: 2` — це «перші два, розвернуті», а не «останні два». Щоб узяти два останні, розверни масив фільтром [reverse](/docs/filters/reverse) **до** циклу.',
    },
    { type: 'h', text: 'Обʼєкт forloop' },
    {
      type: 'table',
      head: ['Властивість', 'Що повертає'],
      rows: [
        ['`forloop.index`', 'Номер ітерації, рахуючи з **1**.'],
        ['`forloop.index0`', 'Номер ітерації, рахуючи з **0**.'],
        ['`forloop.rindex`', 'Скільки ітерацій лишилось, включно з поточною: на останній — 1.'],
        ['`forloop.rindex0`', 'Те саме, але на останній — 0.'],
        ['`forloop.first`', '`true` на першій ітерації.'],
        ['`forloop.last`', '`true` на останній ітерації.'],
        ['`forloop.length`', 'Загальна кількість ітерацій циклу (з урахуванням `limit` та `offset`, а не розмір масиву).'],
        ['`forloop.parentloop`', '`forloop` зовнішнього циклу; якщо цикл не вкладений — `nil`.'],
      ],
    },
    {
      type: 'example',
      title: 'Усі лічильники разом',
      template: `index | index0 | rindex | rindex0 | first | last | length
{% for step in steps -%}
  {{ forloop.index }} | {{ forloop.index0 }} | {{ forloop.rindex }} | {{ forloop.rindex0 }} | {{ forloop.first }} | {{ forloop.last }} | {{ forloop.length }} — {{ step }}
{% endfor %}`,
      data: { steps: ['шампунь', 'маска', 'термозахист'] },
    },
    {
      type: 'example',
      title: 'Де це потрібно в розмітці',
      template: `{% for tag in product.tags -%}
  <span class="tag{% if forloop.first %} tag--first{% endif %}">{{ tag }}</span>{% unless forloop.last %}, {% endunless %}
{% endfor %}

{%- for image in product.images limit: 2 %}
<img src="{{ image | image_url: width: 600 }}" loading="{% if forloop.first %}eager{% else %}lazy{% endif %}">
{%- endfor %}`,
      preset: 'product',
      note: 'Три найчастіші застосування: роздільник між елементами, але не після останнього (`forloop.last`); особливий клас чи `loading="eager"` для першого (`forloop.first`); нумерація та унікальні `id` (`forloop.index`).',
    },
    {
      type: 'example',
      title: 'Вкладені цикли і parentloop',
      template: `{% for row in rows -%}
  {%- assign row_number = forloop.index -%}
  {%- for cell in row %}
{{ row_number }}.{{ forloop.index }} (через parentloop: {{ forloop.parentloop.index }}.{{ forloop.index }}) — {{ cell }}
  {%- endfor -%}
{%- endfor %}`,
      data: { rows: [['шампунь', 'кондиціонер'], ['маска', 'олійка']] },
      note: 'Усередині вкладеного циклу `forloop` — це вже **внутрішній** лічильник. До зовнішнього дістаються через `forloop.parentloop` — і так само до третього рівня, `forloop.parentloop.parentloop`. На верхньому рівні `parentloop` порожній. Альтернатива, яка читається простіше при глибокій вкладеності, — зберегти зовнішній індекс у змінну перед внутрішнім циклом, як у першій частині рядка.',
    },
    { type: 'h', text: 'cycle' },
    {
      type: 'example',
      title: 'Значення по колу',
      template: `{% for product in collection.products -%}
  <li class="{% cycle 'card--wide', 'card', 'card' %}">{{ product.title }}</li>
{% endfor %}`,
      preset: 'collection',
      note: 'Кожен виклик `cycle` виводить наступне значення зі свого списку, а дійшовши до кінця — починає спочатку. Смугасті рядки таблиці, кожна третя картка широка, чергування двох розкладок — усе це `cycle` без жодної арифметики з `modulo`.',
    },
    {
      type: 'example',
      title: 'Іменовані групи',
      template: `Без імені:
{% for i in (1..2) %}{% cycle 'a', 'b', 'c' %} {% endfor %}
{% for i in (1..2) %}{% cycle 'a', 'b', 'c' %} {% endfor %}

З іменами:
{% for i in (1..2) %}{% cycle 'перший': 'a', 'b', 'c' %} {% endfor %}
{% for i in (1..2) %}{% cycle 'другий': 'a', 'b', 'c' %} {% endfor %}`,
      note: 'Два `cycle` з **однаковим списком значень** Liquid вважає однією групою зі спільним лічильником — тому другий цикл продовжує з `c`, а не починає з `a`. Імʼя групи перед двокрапкою дає кожному `cycle` власний лічильник. У секції, яка може стояти на сторінці двічі, це рятує від «зсунутої» смугастості.',
    },
    { type: 'h', text: 'tablerow' },
    {
      type: 'example',
      title: 'Таблиця з колонками',
      template: `<table>
{% tablerow variant in product.variants cols: 2 %}
  {{ variant.title }} — {{ variant.price | money }}
  <small>рядок {{ tablerowloop.row }}, колонка {{ tablerowloop.col }}{% if tablerowloop.col_last %}, остання в рядку{% endif %}</small>
{% endtablerow %}
</table>`,
      preset: 'product',
      view: 'html',
      note: '`tablerow` сам генерує `<tr class="row1">` і `<td class="col1">`, тобі лишається обгорнути його в `<table>`. `cols` задає кількість колонок; без нього все піде в один рядок. Підтримуються також `limit`, `offset` і діапазони — як у `for`. Усередині замість `forloop` доступний **`tablerowloop`**: ті самі `index`, `index0`, `rindex`, `rindex0`, `first`, `last`, `length` плюс `row`, `col`, `col0`, `col_first`, `col_last`.',
    },
    {
      type: 'p',
      text: 'У сучасних темах сітки будують на CSS Grid, тож `tablerow` трапляється рідко — переважно в таблицях розмірів і в старих темах. Знати його варто, бо він є в довіднику і про нього люблять спитати як про «тег, яким ти ніколи не користувався».',
    },
    { type: 'h', text: 'Ліміт 50 ітерацій і paginate' },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Чому цикл обривається на 50-му product',
      text: 'У Shopify цикл `for` робить **щонайбільше 50 ітерацій**. Якщо в collection дві сотні product, `{% for product in collection.products %}` покаже перші 50 — без жодної помилки. Щоб дістатися решти, масив обгортають тегом `paginate`: він ділить його на сторінки розміром **від 1 до 250** елементів, а всередині тега той самий `collection.products` віддає вже лише поточну сторінку. Pagination (розбиття на сторінки) сягає не далі 25 000-го елемента. Детальніше — [collection і pagination](/docs/shopify/collection-and-pagination).',
    },
    {
      type: 'example',
      title: 'paginate + for',
      template: `{% paginate collection.products by 2 %}
  {%- for product in collection.products %}
  {{ product.title }}
  {%- endfor %}

  Сторінка {{ paginate.current_page }} з {{ paginate.pages }}, усього товарів: {{ paginate.items }}
{% endpaginate %}`,
      preset: 'collection',
      data: { current_page: 2 },
      note: 'У пісочниці номер сторінки задає змінна `current_page` (у Shopify — параметр `?page=2` в адресі). Зміни її на `3` — побачиш останню, неповну сторінку.',
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'limit не економить запити',
      text: '`limit: 4` обмежує кількість **ітерацій**, але не обсяг даних, які Shopify підтягне: звернення до `collection.products` усе одно завантажить до 50 product. Довідка Shopify радить для масивів, що підтримують pagination, обгортати цикл у `{% paginate collection.products by 4 %}` (і лишати `limit: 4`), навіть якщо самі посилання на сторінки не виводяться, — так сервер запитує менше. Тема для розмови про [performance](/docs/shopify/performance).',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: що таке forloop і які в нього властивості?',
      text: 'Обʼєкт, який Liquid автоматично створює всередині кожного `for`. Назви: `index` / `index0` (з одиниці і з нуля), `rindex` / `rindex0` (зворотний відлік), `first` / `last` (булеві), `length` і `parentloop` для вкладених циклів. Одразу дай застосування: кома між елементами через `forloop.last`, `loading="eager"` для першого зображення, унікальні `id`.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: у collection 300 product, а цикл показує 50. Чому?',
      text: 'Бо `for` у Shopify обмежений 50 ітераціями. Рішення — `paginate` (до 250 на сторінку) і навігація по сторінках через обʼєкт `paginate` або фільтр `default_pagination`. Якщо питають далі «а як показати всі 300 на одній сторінці?» — чесна відповідь: засобами Liquid за один рендер ніяк; це робиться довантаженням наступних сторінок із JavaScript (Section Rendering API) або через Storefront API.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: у якому порядку діють limit, offset і reversed?',
      text: 'Завжди `offset` → `limit` → `reversed`, незалежно від порядку запису. Наслідок: `reversed limit: 3` дає перші три елементи у зворотному порядку, а не останні три. Для останніх трьох масив спершу розвертають фільтром `reverse` через `assign`. Сюди ж — улюблене уточнення: «чи можна поставити `where` просто в тег `for`?» Ні: фільтри в заголовку `for` не працюють, потрібен проміжний `assign`.',
    },
  ],
}

/* ═══════════════════════════ 3. Теги шаблону ═══════════════════════════ */

const template: DocPage = {
  slug: 'template',
  section: 'tags',
  title: 'Теги шаблону: comment, raw, liquid, echo, render, include, doc',
  summary:
    'Службові теги: коментарі (`comment` та інлайн `{% # %}`), `raw`, багаторядковий `liquid` з `echo`, підключення сніпетів через `render` (і чому `include` deprecated), документація сніпета в `doc`.',
  officialUrl: 'https://shopify.github.io/liquid/tags/template/',
  related: ['shopify/snippets-render', 'tags/variable', 'basics/whitespace', 'shopify/deprecated', 'shopify/performance'],
  blocks: [
    {
      type: 'p',
      text: 'Ці теги не про логіку даних, а про сам шаблон: що сховати від рушія, що не виконувати, як писати Liquid без частоколу `{% %}` і як ділити тему на сніпети. Найважливіший тут — `render`: питання «чим він відрізняється від `include`» звучить майже на кожній співбесіді.',
    },
    { type: 'h', text: 'comment' },
    {
      type: 'example',
      title: 'Блоковий коментар',
      template: `Ціна: {{ price | money }}
{% comment %}
  TODO: показати стару ціну, коли зʼявиться compare_at_price.
  {{ compare_at_price | money }}
{% endcomment %}
Кінець картки`,
      data: { price: 64900, compare_at_price: 79900 },
      preset: 'shop',
      note: 'Усе між `comment` і `endcomment` зникає з output, а Liquid усередині не виконується. На відміну від HTML-коментаря, до браузера не потрапляє нічого.',
    },
    {
      type: 'example',
      title: 'HTML-коментар — це не коментар для Liquid',
      template: `<!-- стара ціна: {{ compare_at_price | money }} -->
{% comment %} стара ціна: {{ compare_at_price | money }} {% endcomment %}`,
      data: { compare_at_price: 79900 },
      preset: 'shop',
      note: 'Для Liquid `<!-- -->` — звичайний текст: вираз усередині **виконується**, а результат їде в браузер у вихідному коді сторінки. «Закоментувати» так цикл — означає й далі його виконувати і роздувати HTML. Логіку вимикай лише Liquid-коментарями.',
    },
    { type: 'h', text: 'Інлайн-коментар {% # %}' },
    {
      type: 'example',
      title: 'Один рядок і кілька рядків',
      template: `{% # Бейдж показуємо лише для хітів %}
{% if tags contains 'хіт' %}★ Хіт продажів{% endif %}

{%
  # Багаторядковий варіант:
  # кожен рядок починається з решітки.
%}
{% # assign debug = true %}
Готово`,
      data: { tags: ['догляд', 'хіт'] },
      note: 'Тег, який починається з `#`, — коментар. Ним зручно підписати рядок або тимчасово вимкнути один тег (як `assign debug` вище) без обгортання в `comment … endcomment`.',
    },
    {
      type: 'example',
      title: 'Пастка багаторядкового інлайн-коментаря',
      template: `{%
  # перший рядок із решіткою
  а цей — без
%}`,
      expectError: true,
      note: 'У багаторядковому варіанті `#` мусить стояти на початку **кожного** рядка, інакше — синтаксична помилка. Так само в Shopify.',
    },
    { type: 'h', text: 'raw' },
    {
      type: 'example',
      title: 'Вимкнути Liquid на ділянці',
      template: `{% raw %}
<script type="text/x-template" id="cart-line">
  <li>{{ item.title }} × {{ item.quantity }}</li>
</script>
{% endraw %}

Щоб вивести змінну, пиши {% raw %}{{ product.title }}{% endraw %} — а це вже справжній вивід: {{ product.title }}`,
      data: { product: { title: 'Шампунь із кератином' } },
      note: 'Усередині `raw` фігурні дужки лишаються текстом. Потрібно у двох випадках: клієнтський шаблонізатор із тим самим синтаксисом `{{ }}` (Vue, Handlebars, Mustache) і документація, де треба показати код Liquid, а не виконати його.',
    },
    { type: 'h', text: 'liquid' },
    {
      type: 'example',
      title: 'Багато логіки без частоколу дужок',
      template: `{% liquid
  # Усередині — по одному тегу на рядок, без роздільників
  assign price = product.price
  assign compare = product.compare_at_price

  if compare > price
    assign saving = compare | minus: price
    echo 'Економія: '
    echo saving | money
  else
    echo 'Звичайна ціна'
  endif
%}`,
      preset: 'product',
      note: 'Правила тегу `liquid`: **кожен тег на своєму рядку**, роздільники `{% %}` не пишуться, коментар — рядок із `#`, а виводити замість `{{ }}` треба тегом `echo`. Порожні рядки дозволені. Бонус: блок нічого не виводить, крім `echo`, тож відпадає потреба розставляти дефіси проти зайвих пробілів.',
    },
    {
      type: 'note',
      tone: 'tip',
      title: 'Коли брати liquid',
      text: 'Орієнтир із практики: три й більше тегів логіки поспіль без HTML між ними — привід для `{% liquid %}`. Зазвичай це «шапка» секції чи сніпета, де обчислюються змінні, класи, розміри зображень. Розмітку з HTML у `liquid` не запхаєш — там лише теги.',
    },
    { type: 'h', text: 'echo' },
    {
      type: 'example',
      title: 'Output усередині liquid',
      template: `{% liquid
  for tag in product.tags
    echo tag | capitalize
    unless forloop.last
      echo ' · '
    endunless
  endfor
%}

{% echo product.title | upcase %}`,
      preset: 'product',
      note: '`echo` — це `{{ }}` у формі тегу: той самий вираз і ті самі фільтри. Поза `liquid` він теж працює (останній рядок), але там немає причин писати його замість `{{ }}`.',
    },
    { type: 'h', text: 'render' },
    {
      type: 'p',
      text: '`render` вставляє сніпет — файл із теки `snippets/`. Головна його властивість — **ізольований scope** (межі, у яких видно змінні): сніпет не бачить змінних, створених у файлі, що його викликав, а його власні змінні не витікають назовні. Усе потрібне передається явно, параметрами — як аргументи у функцію.',
    },
    {
      type: 'example',
      title: 'Параметри — єдиний вхід',
      template: `{% assign badge_text = 'Хіт' %}
{% render 'product-card', title: product.title, vendor: product.vendor %}
{% render 'product-card', title: 'Подарункова карта', vendor: 'Liquid Lab', badge: badge_text %}`,
      snippets: {
        'product-card': `<article>
  {%- if badge %}<b>{{ badge }}</b> {% endif -%}
  {{ title }} · {{ vendor }} (badge_text усередині: «{{ badge_text }}»)
</article>`,
      },
      preset: 'product',
      note: 'Параметри йдуть через кому у форматі `імʼя: значення`. Змінна `badge_text` існує у зовнішньому файлі, але сніпет її **не бачить** — лапки порожні в обох викликах. У другий виклик вона потрапила лише тому, що її явно передали під імʼям `badge`.',
    },
    {
      type: 'example',
      title: 'Зміни всередині не виходять назовні',
      template: `{% assign qty = 1 -%}
{% render 'doubler', qty: qty %}
Зовні після render: qty = {{ qty }}, result = «{{ result }}»`,
      snippets: {
        doubler: `{% assign qty = qty | times: 2 %}{% assign result = 'готово' %}Усередині: qty = {{ qty }}, result = {{ result }}`,
      },
      note: 'Сніпет отримує **копію** значення: перезапис параметра всередині зовнішню змінну не чіпає. І `result`, створений у сніпеті, зовні не існує. Повернути значення зі сніпета неможливо — лише вивести. (Штатний обхід — обгорнути `render` у `capture` і забрати output як string.)',
    },
    {
      type: 'example',
      title: 'with … as — передати один обʼєкт',
      template: `{% render 'variant-row' with product.variants.first as variant %}
{% render 'variant' with product.variants.last %}`,
      snippets: {
        'variant-row': `{{ variant.title }}: артикул {{ variant.sku }}`,
        variant: `{{ variant.title }}: {% if variant.available %}є{% else %}немає{% endif %}`,
      },
      preset: 'product',
      note: '`with обʼєкт as імʼя` — те саме, що параметр `імʼя: обʼєкт`. Без `as` обʼєкт потрапить у змінну, названу **як сам сніпет** (другий рядок: сніпет `variant` → змінна `variant`). Неявні імена читаються гірше, тож `as` краще писати завжди.',
    },
    {
      type: 'example',
      title: 'for … as — сніпет на кожен елемент',
      template: `<ul>
{% render 'variant-item' for product.variants as variant, currency: '₴' %}
</ul>`,
      snippets: {
        'variant-item': `  <li>{{ forloop.index }}/{{ forloop.length }} · {{ variant.title }}{% unless variant.available %} (розпродано){% endunless %}</li>
`,
      },
      preset: 'product',
      note: 'Сніпет рендериться по разу на кожен елемент масиву, і всередині нього доступний `forloop`. Це коротший запис для «`for` + `render`». Додаткові параметри дописуються через кому.',
    },
    {
      type: 'example',
      title: 'Що саме ізольовано: обʼєкти проходять, assign — ні',
      template: `{% assign heading = 'Наш магазин' -%}
{% render 'shop-line' %}`,
      snippets: { 'shop-line': `[{{ heading }}] Магазин: {{ shop.name }}` },
      preset: 'shop',
      note: 'Обидва імені сніпет бере «з повітря», але доходить лише одне. `shop` — **глобальний обʼєкт**, і його видно без передавання. `heading` створений через `assign` у зовнішньому шаблоні — і саме він у квадратних дужках порожній. Ось що насправді означає «ізольований scope»: ізольовані ТВОЇ змінні, а не дані магазину.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Обмеження render у темах',
      text: 'Імʼя сніпета — **лише літерал string** у лапках: `{% render snippet_name %}` зі змінною Shopify не прийме (пісочниця тут поблажливіша). Усередині сніпета, викликаного через `render`, не можна користуватись `include`. Тим самим тегом `render` підключаються блоки застосунків: `{% render block %}` у циклі по `section.blocks`. Більше — на сторінці [сніпети і render](/docs/shopify/snippets-render).',
    },
    { type: 'h', text: 'include (deprecated)' },
    {
      type: 'example',
      title: 'Спільний scope',
      template: `{% assign heading = 'Нещодавно переглянуті' -%}
{% include 'legacy-title' %}
Зовні після include: counter = {{ counter }}`,
      snippets: {
        'legacy-title': `<h2>{{ heading }}</h2>{% assign counter = 42 %}`,
      },
      note: '`include` вставляє сніпет так, ніби його код написано просто тут: він бачить **усі** зовнішні змінні (`heading` ніхто не передавав) і **створює змінні назовні** (`counter` зʼявився у зовнішньому файлі). Порівняй із прикладом про `render` вище.',
    },
    {
      type: 'p',
      text: 'Саме через це `include` позначено як deprecated. Сніпет із неявними залежностями неможливо зрозуміти, не прочитавши всі місця, де його підключено; він може мовчки перезаписати чужу змінну; а рушієві доводиться тягнути весь контекст у кожне підключення — довідка Shopify прямо називає і гіршу performance, і гірший супровід коду. У нових темах `include` немає; у старих він трапляється, і міграція на `render` — типове завдання.',
    },
    {
      type: 'table',
      head: ['', '`render`', '`include`'],
      rows: [
        ['Scope', 'ізольований', 'спільний з файлом, що підключає'],
        ['Зовнішні змінні (`assign`, `capture`)', 'лише передані параметрами', 'видно всі'],
        ['Змінні, створені у сніпеті', 'лишаються всередині', 'витікають назовні'],
        ['Глобальні обʼєкти Shopify', 'доступні', 'доступні'],
        ['Імʼя сніпета', 'лише літерал у лапках', 'може бути змінною'],
        ['Цикл по масиву', '`for … as`, усередині є `forloop`', '`for`, без ізоляції'],
        ['`{% break %}` поза циклом у сніпеті', 'зупиняє лише сніпет', 'зупиняє і файл, що підключив'],
        ['Статус', 'актуальний', 'deprecated'],
      ],
    },
    {
      type: 'example',
      title: 'break як ранній вихід зі сніпета',
      template: `Хлібні крихти: [{% render 'breadcrumbs', page_type: 'index' %}]
Хлібні крихти: [{% render 'breadcrumbs', page_type: 'product' %}]
Решта сторінки рендериться далі`,
      snippets: {
        breadcrumbs: `{%- if page_type == 'index' %}{% break %}{% endif -%}
Головна / Каталог`,
      },
      note: 'Поза циклом `{% break %}` обриває рендер **поточного файлу**. Сніпет через `render` має власний контекст, тому зупиняється тільки він. Це заміна обгортанню всього файлу в один великий `if`.',
    },
    { type: 'h', text: 'doc (LiquidDoc)' },
    {
      type: 'example',
      title: 'Документація сніпета',
      template: `{% doc %}
  Картка товару для сіток і каруселей.

  @param {string} title - Назва товару
  @param {number} price - Ціна в копійках
  @param {boolean} [show_badge] - Необовʼязковий: показати бейдж «Хіт»

  @example
  {% render 'product-card', title: product.title, price: product.price %}
{% enddoc %}
<article>{{ title }} — {{ price | money }}{% if show_badge %} ★{% endif %}</article>`,
      data: { title: 'Олійка для кінчиків', price: 39900, show_badge: true },
      preset: 'shop',
      note: 'Вміст `doc` не виводиться і не виконується (навіть `render` в `@example`). Це опис «сигнатури» сніпета: `@param {тип} імʼя - опис`, квадратні дужки навколо імені — параметр необовʼязковий, `@example` — зразок виклику.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Навіщо doc, якщо є comment',
      text: 'Бо `doc` читають **інструменти**: за описом параметрів редактор дає автодоповнення і підказки при наведенні на `render`, а лінтер Theme Check звіряє виклики `render` з описаними параметрами. Разом з ізоляцією `render` це перетворює сніпет на функцію з оголошеною сигнатурою. Деталі синтаксису — у довідці LiquidDoc на shopify.dev.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: render чи include — у чому різниця?',
      text: 'Головне слово — **scope**. `render` ізольований: сніпет бачить лише передані параметри та глобальні обʼєкти, і нічого не повертає назовні. `include` ділить scope з батьківським файлом в обидва боки, через що повільніший і непередбачуваний — тому він deprecated. Додай деталі, які видають досвід: у `render` імʼя сніпета мусить бути літералом string, є форми `with … as` і `for … as`, а `include` всередині `render` заборонений.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: як передати дані у сніпет і отримати щось назад?',
      text: 'Усередину — параметрами: `{% render \'card\', product: product, show_vendor: true %}`. Назад — ніяк: змінні сніпета зовні не існують. Якщо потрібен саме результат, сніпет його **виводить**, а зовні виклик обгортають у `{% capture %}` і отримують string. Варто згадати, що глобальні обʼєкти (`settings`, `shop`, `cart`) передавати не треба — вони доступні всюди.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: навіщо тег liquid?',
      text: 'Для читабельності блоків логіки: без `{% %}` на кожному рядку і без боротьби з пробілами. Output у ньому — через `echo`, коментарі — через `#`. Якщо спитають «а що не так із `<!-- -->`?» — Liquid усередині HTML-коментаря виконується і потрапляє у вихідний код сторінки; для вимкнення логіки є `comment` та інлайн `{% # %}`.',
    },
  ],
}

/* ═══════════════════════════ 4. Змінні ═══════════════════════════ */

const variable: DocPage = {
  slug: 'variable',
  section: 'tags',
  title: 'Змінні: assign, capture, increment, decrement',
  summary:
    'Чотири теги, що створюють змінні. `assign` зберігає значення будь-якого типу, `capture` — завжди string, а `increment` / `decrement` — лічильники, які одразу виводяться і живуть окремо від `assign`. Плюс правила scope.',
  officialUrl: 'https://shopify.github.io/liquid/tags/variable/',
  related: ['tags/template', 'tags/iteration', 'basics/types', 'filters/default', 'filters/plus', 'filters/append', 'shopify/snippets-render'],
  blocks: [
    {
      type: 'p',
      text: 'Змінні в Liquid прості: немає оголошень, типів і `const` — будь-який `assign` або створює змінну, або мовчки перезаписує наявну. Складність у трьох місцях, і всі три люблять на співбесідах: `capture` завжди дає string, `increment` живе у власному просторі імен, а scope (межі, у яких видно змінну) влаштований не так, як у JavaScript.',
    },
    { type: 'h', text: 'assign' },
    {
      type: 'example',
      title: 'Будь-який тип і ланцюжок фільтрів',
      template: `{%- assign label = 'Новинка' -%}
{%- assign per_row = 3 -%}
{%- assign ratio = 1.5 -%}
{%- assign show_vendor = true -%}
{%- assign sizes = '250 мл,400 мл,1000 мл' | split: ',' -%}
{%- assign first_variant = product.variants.first -%}
{%- assign short_title = product.title | upcase | truncate: 12 -%}
рядок: {{ label }}
число: {{ per_row | plus: 1 }} і {{ ratio }}
булеве: {{ show_vendor }}
масив: {{ sizes.size }} елементи, перший — {{ sizes.first }}
обʼєкт: {{ first_variant.title }}
після фільтрів: {{ short_title }}`,
      preset: 'product',
      note: 'Праворуч від `=` — **одне значення** (літерал, змінна, властивість обʼєкта) і, за потреби, ланцюжок фільтрів. Літерала масиву в Liquid немає, тому масив «з нічого» отримують через [split](/docs/filters/split).',
    },
    {
      type: 'example',
      title: 'Арифметики операторами немає',
      template: `{% assign total = price + shipping %}{{ total }}`,
      data: { price: 64900, shipping: 8000 },
      expectError: true,
      note: 'Оператора `+` в Liquid не існує, тож і в Shopify суми з такого запису не вийде. Уся математика — фільтрами: `{% assign total = price | plus: shipping %}`. Те саме з умовами: у Shopify `assign` порівнянь не обчислює, і `assign is_big = total > 100000` булевого значення не дасть (пісочниця тут поблажливіша — не перевіряй це на ній). Прапорці роблять через `if`, як у наступному прикладі.',
    },
    {
      type: 'example',
      title: 'Прапорець: assign + if',
      template: `{% liquid
  assign on_sale = false
  if product.compare_at_price > product.price
    assign on_sale = true
  endif

  assign card_class = 'card'
  if on_sale
    assign card_class = card_class | append: ' card--sale'
  endif
%}
<article class="{{ card_class }}">{% if on_sale %}Знижка!{% endif %}</article>`,
      preset: 'product',
      note: 'Стандартний прийом замість «булевого виразу»: задати значення за замовчуванням і перезаписати його всередині `if`. Один раз обчислений прапорець потім використовується в кількох місцях розмітки.',
    },
    {
      type: 'example',
      title: 'Пастка: перезапис обʼєкта Shopify',
      template: `До: {{ product.title }}
{% assign product = 'шампунь' -%}
Після: «{{ product.title }}» — бо product тепер рядок «{{ product }}»`,
      preset: 'product',
      note: 'Захисту від колізій немає: змінна з імʼям `product`, `collection`, `page`, `settings` чи `template` затуляє однойменний обʼєкт до кінця файлу. Довідка Shopify попереджає про це на кожному тегу змінних. Найчастіше так стріляють «очевидні» імена на кшталт `page`, `image` чи `link`: бери специфічніші — `current_page_number`, `card_image`.',
    },
    { type: 'h', text: 'capture' },
    {
      type: 'example',
      title: 'Зібрати string із розмітки й логіки',
      template: `{% capture card_class -%}
  card
  {%- if product.available == false %} card--sold-out{% endif -%}
  {%- if product.compare_at_price > product.price %} card--sale{% endif -%}
  {%- if product.tags contains 'хіт' %} card--hit{% endif -%}
{%- endcapture %}
<article class="{{ card_class }}">{{ product.title }}</article>`,
      preset: 'product',
      note: '`capture` виконує все, що всередині, але замість виводити складає результат у змінну. Усередині можна все: умови, цикли, `render`. Дефіси обовʼязкові, якщо не хочеш отримати string разом з усіма відступами й переносами, — див. [whitespace control](/docs/basics/whitespace).',
    },
    {
      type: 'example',
      title: 'capture завжди дає string',
      template: `{% capture columns %}4{% endcapture %}
{% if columns == 4 %}це число{% else %}columns == 4 → хибно: це рядок "4"{% endif %}
{% if columns == '4' %}columns == '4' → істинно{% endif %}

{% assign columns_number = columns | plus: 0 %}
{% if columns_number == 4 %}після | plus: 0 — уже число{% endif %}`,
      note: 'Навіть якщо всередині лише цифри, результат — **string**, і порівняння з числом хибне. Математичні фільтри самі приводять string до числа, тому найкоротший спосіб перетворити значення на число — `| plus: 0`. Якщо ж значення просте, бери `assign`: він тип зберігає.',
    },
    {
      type: 'note',
      tone: 'tip',
      title: 'assign чи capture',
      text: '`assign` — коли значення вже існує або отримується одним ланцюжком фільтрів: `{% assign url = product.url | append: \'?ref=home\' %}`. `capture` — коли string складається з кількох частин з умовами чи циклами: список класів, `alt`-текст, JSON для `data`-атрибута, результат `render`. Зліплювати довгий string пʼятьма `append` — ознака, що потрібен `capture`.',
    },
    { type: 'h', text: 'increment' },
    {
      type: 'example',
      title: 'Лічильник, який сам себе виводить',
      template: `{% increment slide %}
{% increment slide %}
{% increment slide %}`,
      note: 'Три особливості в одному прикладі. Змінну не треба створювати заздалегідь. Відлік починається з **0**. І тег **одразу виводить** значення — це output, а не тиха операція: спершу виводить поточне число, потім збільшує на 1.',
    },
    { type: 'h', text: 'decrement' },
    {
      type: 'example',
      title: 'Те саме вниз — але з -1',
      template: `{% decrement countdown %}
{% decrement countdown %}
{% decrement countdown %}`,
      note: '`decrement` несиметричний: він **спершу зменшує**, а потім виводить, тому перше значення в output — `-1`, а не `0`. Запамʼятовується так: `increment` — 0, 1, 2; `decrement` — -1, -2, -3.',
    },
    { type: 'h', text: 'Окремий простір імен — класична пастка' },
    {
      type: 'example',
      title: 'increment не бачить assign, і навпаки',
      template: `{% assign counter = 10 %}
{% increment counter %}
{% increment counter %}
counter = {{ counter }}`,
      note: 'Інтуїція підказує «10, 11, потім 12». Насправді `increment` веде **власну** змінну `counter` у окремому просторі імен: вона стартує з 0 і про `assign` нічого не знає. А `{{ counter }}` читає змінну з `assign` — вона так і лишилась 10. Дві змінні з одним імʼям, які ніколи не зустрінуться.',
    },
    {
      type: 'example',
      title: 'increment і decrement — спільний лічильник',
      template: `{% increment n %} {% increment n %} {% decrement n %} {% decrement n %} {% increment n %}`,
      note: 'Між собою ці два теги змінну **ділять**. Простеж: виводить 0 (стало 1) → виводить 1 (стало 2) → зменшує до 1 і виводить → зменшує до 0 і виводить → виводить 0 (стало 1).',
    },
    {
      type: 'example',
      title: 'Чому increment — не лічильник для логіки',
      template: `Через increment: {% for variant in product.variants %}{% if variant.available %}{% increment in_stock %}{% endif %}{% endfor %}

{% assign available_count = 0 -%}
{% for variant in product.variants -%}
  {%- if variant.available %}{% assign available_count = available_count | plus: 1 %}{% endif -%}
{%- endfor -%}
Через assign + plus: доступно {{ available_count }} з {{ product.variants.size }}`,
      preset: 'product',
      note: 'Перший рядок засмічений цифрами: `increment` не вміє рахувати мовчки. Для підрахунку в циклі правильний шлях — `assign` із фільтром [plus](/docs/filters/plus). А якщо потрібен просто номер ітерації — він уже є у `forloop.index`. Тут, до речі, взагалі досить `product.variants | where: \'available\' | size`.',
    },
    {
      type: 'note',
      tone: 'shopify',
      title: 'Де живе лічильник у темі',
      text: 'За довідкою Shopify, змінна `increment` / `decrement` унікальна в межах файлу, де створена, — layout, шаблону або секції — і спільна зі сніпетами, підключеними в цьому файлі. Дві секції на сторінці мають незалежні лічильники, навіть з однаковим імʼям. Чесне застосування цих тегів вузьке: унікальні суфікси для `id` / `for` у межах одного файлу, коли `forloop.index` недоступний.',
    },
    { type: 'h', text: 'Scope' },
    {
      type: 'p',
      text: 'У Liquid **немає блокового scope**. `assign` усередині `if`, `for` чи `capture` створює змінну рівня всього файлу — вона доступна й після закриття блока. Виняток — службові змінні самого циклу: змінна ітерації та `forloop` зникають разом з `endfor`.',
    },
    {
      type: 'example',
      title: 'assign у циклі видно після циклу',
      template: `{% assign cheapest = nil -%}
{% for variant in product.variants -%}
  {%- if variant.available -%}
    {%- if cheapest == nil or variant.price < cheapest.price %}{% assign cheapest = variant %}{% endif -%}
  {%- endif -%}
  {%- assign last_seen = variant.title -%}
{%- endfor -%}
Найдешевший доступний: {{ cheapest.title }} — {{ cheapest.price | money }}
Останній переглянутий у циклі: {{ last_seen }}
Змінна циклу після endfor: «{{ variant.title }}», forloop: «{{ forloop.index }}»`,
      preset: 'product',
      note: '`cheapest` і `last_seen` пережили цикл — на цьому тримається патерн «знайти в циклі, показати після». А `variant` і `forloop` зовні порожні.',
    },
    {
      type: 'example',
      title: 'Пастка: assign змінної з імʼям змінної циклу',
      template: `{% for item in items -%}
  {%- assign item = 'перезаписано' -%}
  у циклі: {{ item }}
{% endfor -%}
після циклу: {{ item }}`,
      data: { items: ['шампунь', 'маска'] },
      note: 'Змінна циклу живе у внутрішньому scope й **затуляє** зовнішню з тим самим імʼям. `assign` пише у зовнішню — тому всередині циклу його «не видно», а після циклу раптом зʼявляється значення. Висновок простий: не називай змінні так само, як змінну ітерації.',
    },
    {
      type: 'example',
      title: 'Межа, яку assign не перетинає: render',
      template: `{% assign currency = '₴' -%}
{% render 'price-line', amount: 649 %}
Зовні: formatted = «{{ formatted }}»`,
      snippets: {
        'price-line': `{% assign formatted = amount | append: ' ' | append: currency %}Усередині: «{{ formatted }}» (currency зовні не передали)`,
      },
      note: 'Сніпет через `render` — окремий scope в обидва боки: `currency` всередину не потрапила, `formatted` назовні не вийшла. Те саме з секціями: кожна рендериться у власному контексті, тож `assign` у `layout/theme.liquid` у секції не видно. Дані між файлами передають параметрами `render`, через settings або глобальні обʼєкти.',
    },
    {
      type: 'table',
      head: ['Де створено змінну', 'Де її видно'],
      rows: [
        ['`assign` / `capture` на верхньому рівні файлу', 'від місця створення до кінця цього файлу'],
        ['`assign` / `capture` всередині `if`, `for`, `case`, `capture`', 'так само — до кінця файлу, блок її не обмежує'],
        ['змінна ітерації та `forloop`', 'лише всередині свого `for`'],
        ['`assign` у сніпеті через `render`', 'лише всередині сніпета'],
        ['`assign` у сніпеті через `include`', 'і в сніпеті, і у файлі, що підключив (тому `include` deprecated)'],
        ['параметр `render`', 'лише всередині сніпета; зміни назовні не повертаються'],
        ['`increment` / `decrement`', 'окремий простір імен; з `assign` не перетинається'],
      ],
    },
    {
      type: 'note',
      tone: 'warn',
      title: 'Порядок має значення',
      text: 'Змінна існує лише **нижче** місця, де її створено: шаблон виконується згори вниз за один прохід, «підняття» оголошень немає. Звернення до ще не створеної змінної — не помилка, а `nil`, тобто порожнє місце в output. Тому одруківка в імені змінної теж мовчазна: `{{ prodcut.title }}` просто нічого не виведе.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: що виведе assign x = 10, два increment x і {{ x }}?',
      text: '`0`, `1` і `10`. Пояснення, якого чекають: `increment` / `decrement` зберігають лічильники в окремому просторі імен, незалежному від `assign` і `capture` (між собою ці два теги змінну ділять); `increment` стартує з 0, `decrement` — з -1; обидва одразу виводять значення. Тому для підрахунків у логіці беруть `assign` + `plus`, а не `increment`.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: чим capture відрізняється від assign?',
      text: '`assign` зберігає **значення з його типом** — число, булеве, масив, обʼєкт. `capture` зберігає **відрендерений фрагмент шаблону**, тож результат завжди string, разом з усіма пробілами й переносами всередині. Звідси дві практичні пастки: `{% capture n %}5{% endcapture %}` не дорівнює числу 5 (лікується `| plus: 0`), і без дефісів у змінну потрапляють відступи.',
    },
    {
      type: 'note',
      tone: 'interview',
      title: 'Питання: чи видно змінну, створену в циклі, після циклу?',
      text: 'Так: блокового scope в Liquid немає, `assign` у `for` чи `if` видно до кінця файлу. Зникають лише змінна ітерації та `forloop`. Справжні межі — це **файли**: сніпет через `render` і кожна секція мають ізольований контекст. Якщо додаси, що саме ця ізоляція відрізняє `render` від deprecated `include`, — відповідь звучатиме повною.',
    },
  ],
}

export const tagsPages: DocPage[] = [controlFlow, iteration, template, variable]
